import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { FaEdit, FaFileAlt, FaFileContract, FaQuoteRight, FaList, FaExclamationCircle, FaCheckCircle, FaPlus, FaTrash, FaCheck, FaFilter, FaLink, FaUserPlus, FaExclamationTriangle } from 'react-icons/fa';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Clientes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [planos, setPlanos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('dados');
  const [listTab, setListTab] = useState('ativos');
  const [currentUserRole, setCurrentUserRole] = useState('');

  // Estados para Filtros Avançados (Admin)
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vendedor: '',
    idadeMin: '',
    idadeMax: '',
    tempoMin: '', 
    tempoMax: '', 
    plano: ''
  });

  // Estados para o Modal de Adicionar Cliente
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState('dados');
  const [newClientData, setNewClientData] = useState({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '', planoId: '', empresaId: '', tipo: 'Titular', valor: '', valorAdesao: '', vencimento: '', vendedor: '', status: 'Ativo', observacao: '', titularId: '' });
  const [newClientDocs, setNewClientDocs] = useState({ rgCnh: '', comprovanteEndereco: '' });
  const [planItems, setPlanItems] = useState([]);
  const [tempPlanItem, setTempPlanItem] = useState({ descricao: '', valor: '' });
  const [newCotacao, setNewCotacao] = useState({ descricao: '', valor: '', status: 'Em Análise' });

  // Função auxiliar para calcular idade
  const calculateAge = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '';
  };

  // Função auxiliar para calcular tempo de permanência em meses
  const calculateMonths = (dateString) => {
      if (!dateString) return 0;
      const parts = dateString.split('/');
      if (parts.length !== 3) return 0;
      const joinDate = new Date(parts[2], parts[1] - 1, parts[0]);
      const today = new Date();
      let months = (today.getFullYear() - joinDate.getFullYear()) * 12;
      months -= joinDate.getMonth();
      months += today.getMonth();
      return months >= 0 ? months : 0;
  };

  const getAgeBracket = (age) => {
    if (age <= 18) return '00-18 anos';
    if (age >= 19 && age <= 23) return '19-23 anos';
    if (age >= 24 && age <= 28) return '24-28 anos';
    if (age >= 29 && age <= 33) return '29-33 anos';
    if (age >= 34 && age <= 38) return '34-38 anos';
    if (age >= 39 && age <= 43) return '39-43 anos';
    if (age >= 44 && age <= 48) return '44-48 anos';
    if (age >= 49 && age <= 53) return '49-53 anos';
    if (age >= 54 && age <= 58) return '54-58 anos';
    if (age >= 59) return '59+ anos';
    return null;
  };

  useEffect(() => {
    const fetchClientes = async (user) => {
      try {
        // Busca o cargo do usuário para aplicar filtro
        let userRole = 'Vendedor';
        try {
            const roleResponse = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${user.uid}.json`);
            const roleData = await roleResponse.json();
            if (roleData && roleData.cargo) {
                userRole = roleData.cargo;
                setCurrentUserRole(userRole);
            }
        } catch (error) {
            console.error("Erro ao buscar cargo do usuário:", error);
        }

        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json');
        
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} (Verifique as Regras do Firebase)`);
        }

        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data) {
          const clientesData = data.Clientes || data;
          const loadedClientes = Object.keys(clientesData).map(key => {
            const item = clientesData[key];
            if (!item) return null;

            // --- NORMALIZAÇÃO DE DOCUMENTOS ---
            // Unifica o formato dos documentos, seja do formulário externo (objeto) ou upload interno (array)
            let normalizedDocs = [];
            if (item.documentos) {
                if (Array.isArray(item.documentos)) {
                    // Formato de array (upload interno), apenas usa
                    normalizedDocs = item.documentos;
                } else if (typeof item.documentos === 'object' && item.documentos !== null && !Array.isArray(item.documentos)) {
                    // Formato de objeto (formulário externo), converte para array
                    if (item.documentos.rgCnh) {
                        normalizedDocs.push({
                            nome: 'RG_CNH_(Cadastro Externo).pdf',
                            arquivo: item.documentos.rgCnh,
                            data: item['ADESÃO'] || new Date().toLocaleDateString('pt-BR')
                        });
                    }
                    if (item.documentos.comprovanteEndereco) {
                        normalizedDocs.push({ nome: 'Comprovante_Endereco_(Cadastro Externo).pdf', arquivo: item.documentos.comprovanteEndereco, data: item['ADESÃO'] || new Date().toLocaleDateString('pt-BR') });
                    }
                }
            }

            // Filtra apenas os clientes criados pelo usuário logado, exceto se for Admin ou Financeiro
            if (userRole !== 'Admin' && userRole !== 'Financeiro' && item.createdId !== user.uid) return null;

            // Função auxiliar para formatar datas
            const normalizeDate = (dateStr) => {
                if (!dateStr) return '-';
                const parts = dateStr.split('/');
                if (parts.length !== 3) return dateStr;
                let day = parseInt(parts[0], 10);
                let month = parseInt(parts[1], 10);
                let year = parseInt(parts[2], 10);
                // Detecta formato M/D/Y (comum em alguns bancos) e inverte para D/M/Y
                if (month > 12) { const temp = day; day = month; month = temp; }
                return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            };
            
            let vencimentoDay = '-';
            if (item.VENCIMENTO) {
                const vencStr = String(item.VENCIMENTO);
                if (vencStr.includes('/')) {
                    // Se for data completa, pega só o dia
                    vencimentoDay = vencStr.split('/')[0];
                } else {
                    vencimentoDay = vencStr; // Já é só o dia
                }
            }

            return {
              id: key,
              nome: item.USUARIO,
              cpf: item.CPF,
              dataNascimento: normalizeDate(item['DATA NASC']),
              mensalidade: item.MENSALIDADE,
              ValorAdesao: item.ValorAdesao,
              plano: item.PLANO,
              telefone: item.TELEFONE,
              vencimento: vencimentoDay,
              dataCadastro: normalizeDate(item['ADESÃO']),
              contratoTipo: item.CONTRATO,
              vendedor: item.VENDEDOR || '',
              empresaId: item.empresaId || '',
              planoId: item.planoId || '', // Adiciona o ID do plano
              status: item.STATUS || 'Ativo', // Valor padrão
              email: item.EMAIL || '', // Valor padrão
              documentos: normalizedDocs,
              contratos: item.contratos || [],
              faturas: item.faturas || [],
              cotacoes: item.cotacoes || [],
              observacao: item.OBSERVACAO || ''
            };
          }).filter(item => item !== null);
          setClientes(loadedClientes);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };

    const fetchVendedores = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe.json');
        const data = await response.json();
        if (data) {
          // Mapeia todos os usuários da equipe, incluindo o ID
          const lista = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setVendedores(lista);
        }
      } catch (error) {
        console.error("Erro ao buscar vendedores:", error);
      }
    };

    const fetchPlanos = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/planos.json');
        const data = await response.json();
        if (data) {
          const lista = Object.keys(data).map(key => {
            const item = data[key];
            if (!item) return null;
            return { id: key, ...item };
          }).filter(plano => plano && (!plano.status || plano.status === 'Ativo'));
          setPlanos(lista);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };

    const fetchEmpresas = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/empresas.json');
        const data = await response.json();
        if (data) {
          const lista = Object.keys(data)
            .map(key => ({ id: key, ...data[key] }))
            .filter(empresa => empresa.status === 'Ativa');
          setEmpresas(lista);
        }
      } catch (error) {
        console.error("Erro ao buscar empresas:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchClientes(user);
        fetchVendedores();
        fetchPlanos();
        fetchEmpresas();
      }
    });
    return () => unsubscribe();
  }, []);

  // Efeito para abrir o modal automaticamente se vier da página de Análises
  useEffect(() => {
    if (location.state?.openClientId && clientes.length > 0) {
        const clientToOpen = clientes.find(c => c.id === location.state.openClientId);
        if (clientToOpen) {
            setSelectedClient(clientToOpen);
            setActiveTab('dados');
            setModalOpen(true);
            // Limpa o state para evitar reabertura indesejada ao atualizar a lista
            navigate(location.pathname, { replace: true, state: {} });
        }
    }
  }, [clientes, location, navigate]);

  // Efeito para preencher o valor da mensalidade ao selecionar plano e data de nascimento (NOVO CLIENTE)
  useEffect(() => {
    if (newClientData.planoId && newClientData.dataNascimento && planos.length > 0) {
        const age = calculateAge(newClientData.dataNascimento);
        if (age === '' || age < 0) return;

        const selectedPlanData = planos.find(p => p.id === newClientData.planoId);
        if (!selectedPlanData) return;

        const ageBracket = getAgeBracket(age);
        if (!ageBracket) return;

        let price = selectedPlanData[ageBracket];
        if (price) {
            // Normaliza o preço (ex: "431,9" -> 431.90) para garantir que o maskCurrency funcione corretamente
            const numericPrice = parseFloat(price.replace(/\./g, '').replace(',', '.'));
            setNewClientData(prev => ({
                ...prev,
                valor: maskCurrency(numericPrice.toFixed(2)),
                valorAdesao: maskCurrency(numericPrice.toFixed(2))
            }));
        }
    }
  }, [newClientData.planoId, newClientData.dataNascimento, planos]);

  // Efeito para preencher o valor da mensalidade ao selecionar plano e data de nascimento (EDITAR CLIENTE)
  useEffect(() => {
    if (selectedClient && selectedClient.planoId && selectedClient.dataNascimento && planos.length > 0) {
      const age = calculateAge(selectedClient.dataNascimento);
      if (age === '' || age < 0) return;

      const selectedPlanData = planos.find(p => p.id === selectedClient.planoId);
      if (!selectedPlanData) return;

      const ageBracket = getAgeBracket(age);
      if (!ageBracket) return;

      let price = selectedPlanData[ageBracket];
      // Adiciona verificação para evitar loop infinito de re-renderização
      if (price) {
        const numericPrice = parseFloat(price.replace(/\./g, '').replace(',', '.'));
        const formattedPrice = maskCurrency(numericPrice.toFixed(2));
        if (selectedClient.mensalidade !== formattedPrice) {
            setSelectedClient(prev => ({ ...prev, mensalidade: formattedPrice }));
        }
      }
    }
  }, [selectedClient, planos]);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      const nome = cliente.nome || '';
      const nomeMatch = nome.toLowerCase().includes(filtroNome.toLowerCase());
      
      let tabMatch = true;
      if (listTab === 'ativos') {
        tabMatch = cliente.status === 'Ativo';
      } else if (listTab === 'inativos') {
        tabMatch = cliente.status === 'Inativo';
      } else if (listTab === 'contatos') {
        tabMatch = cliente.status === 'Contato' || cliente.status === 'Pendente';
      } else if (listTab === 'cotacoes') {
        tabMatch = cliente.status === 'Cotação';
      } else if (listTab === 'inclusao') {
        tabMatch = cliente.status === 'INCLUSÃO';
      } else if (listTab === 'pre-cancelamento') {
        tabMatch = cliente.status === 'Pré-Cancelamento';
      }

      // Filtros Avançados (Admin)
      let advancedMatch = true;
      if (currentUserRole === 'Admin') {
          if (filters.vendedor && cliente.vendedor !== filters.vendedor) advancedMatch = false;
          if (filters.plano && cliente.plano !== filters.plano) advancedMatch = false;
          
          if (filters.idadeMin || filters.idadeMax) {
              const age = calculateAge(cliente.dataNascimento);
              if (age !== '') {
                  if (filters.idadeMin && age < parseInt(filters.idadeMin)) advancedMatch = false;
                  if (filters.idadeMax && age > parseInt(filters.idadeMax)) advancedMatch = false;
              } else if (filters.idadeMin || filters.idadeMax) {
                  // Se tem filtro de idade mas o cliente não tem data válida, exclui
                  advancedMatch = false;
              }
          }

          if (filters.tempoMin || filters.tempoMax) {
              const months = calculateMonths(cliente.dataCadastro);
              if (filters.tempoMin && months < parseInt(filters.tempoMin)) advancedMatch = false;
              if (filters.tempoMax && months > parseInt(filters.tempoMax)) advancedMatch = false;
          }
      }

      return nomeMatch && tabMatch && advancedMatch;
    }).sort((a, b) => {
      return (a.nome || '').localeCompare(b.nome || '');
    });
  }, [clientes, filtroNome, listTab, filters, currentUserRole]);

  // Lista única de planos para o filtro, baseada nos planos ativos carregados
  const uniquePlansForFilter = useMemo(() => {
      // Usamos o estado 'planos' que já é buscado e filtrado por status 'Ativo'
      return [...new Set(planos.map(p => `${p.Plano} - ${p.Acomodação}`))].sort((a, b) => a.localeCompare(b));
  }, [planos]);

  // Contagem de clientes em inclusão para notificação
  const inclusaoCount = useMemo(() => {
    return clientes.filter(c => c.status === 'INCLUSÃO').length;
  }, [clientes]);

  const handleFilterChange = (e) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleGerenciarClick = (cliente) => {
    setSelectedClient(cliente);
    setActiveTab('dados'); // Reseta para a primeira aba
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedClient(prev => ({ ...prev, [name]: value }));
  };

  // --- Funções de Máscara ---
  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskDate = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  };

  const maskCurrency = (value) => {
    const v = value.replace(/\D/g, "");
    if (!v) return "";
    const numberValue = (Number(v) / 100).toFixed(2);
    return "R$ " + numberValue.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };

  const removeCurrencyMask = (value) => {
    if (!value) return "";
    const v = value.replace(/\D/g, "");
    if (!v) return "";
    return (Number(v) / 100).toFixed(2);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setNewClientDocs(prev => ({ ...prev, [fieldName]: base64 }));
      } catch (error) {
        console.error("Erro ao converter arquivo:", error);
      }
    }
  };

  const handleFileUpload = async (e, category) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      const newDoc = {
        nome: file.name,
        arquivo: base64,
        data: new Date().toLocaleDateString('pt-BR')
      };

      let currentList = selectedClient[category] || [];
      if (!Array.isArray(currentList)) {
          currentList = Object.values(currentList);
      }
      
      const newList = [...currentList, newDoc];

      await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${selectedClient.id}/${category}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList)
      });

      const updatedClient = { ...selectedClient, [category]: newList };
      setSelectedClient(updatedClient);
      setClientes(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
      
      alert('Arquivo enviado com sucesso!');
      e.target.value = null; 
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
      alert("Erro ao enviar arquivo.");
    }
  };

  const handleFileDelete = async (index, category) => {
    if (!window.confirm('Tem certeza que deseja excluir este arquivo?')) return;

    let currentList = selectedClient[category] || [];
    if (!Array.isArray(currentList)) {
        currentList = Object.values(currentList);
    }

    const newList = currentList.filter((_, i) => i !== index);

    try {
        await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${selectedClient.id}/${category}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newList)
        });

        const updatedClient = { ...selectedClient, [category]: newList };
        setSelectedClient(updatedClient);
        setClientes(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        
        alert('Arquivo excluído com sucesso!');
    } catch (error) {
        console.error("Erro ao excluir arquivo:", error);
        alert("Erro ao excluir arquivo.");
    }
  };

  const handleDownloadFile = (doc) => {
    if (doc.arquivo && doc.arquivo.startsWith('data:image')) {
      try {
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(doc.arquivo);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        const format = doc.arquivo.includes('image/png') ? 'PNG' : 'JPEG';
        pdf.addImage(doc.arquivo, format, 0, 0, pdfWidth, pdfHeight);
        
        const nameParts = doc.nome.split('.');
        const fileName = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : doc.nome;
        pdf.save(`${fileName}.pdf`);
      } catch (error) {
        console.error("Erro ao converter para PDF:", error);
        // Fallback: tenta baixar o arquivo original se a conversão falhar
        const link = document.createElement('a');
        link.href = doc.arquivo;
        link.download = doc.nome;
        link.click();
      }
    } else {
      // Se não for imagem (ex: já é PDF), baixa direto
      const link = document.createElement('a');
      link.href = doc.arquivo;
      link.download = doc.nome;
      link.click();
    }
  };

  const handleAddCotacao = async () => {
    if (!newCotacao.descricao) return;

    const newCot = {
        ...newCotacao,
        data: new Date().toLocaleDateString('pt-BR')
    };

    let currentList = selectedClient.cotacoes || [];
    if (!Array.isArray(currentList)) {
        currentList = Object.values(currentList);
    }

    const newList = [...currentList, newCot];

    try {
        await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${selectedClient.id}/cotacoes.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newList)
        });

        const updatedClient = { ...selectedClient, cotacoes: newList };
        setSelectedClient(updatedClient);
        setClientes(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        setNewCotacao({ descricao: '', valor: '', status: 'Em Análise' });
        alert('Cotação adicionada!');
    } catch (error) {
        console.error("Erro ao adicionar cotação:", error);
        alert("Erro ao adicionar cotação.");
    }
  };

  const handleApproveCotacao = async (index) => {
    if (!window.confirm('Deseja aprovar esta cotação e adicionar o valor à mensalidade?')) return;

    let currentList = selectedClient.cotacoes || [];
    if (!Array.isArray(currentList)) {
        currentList = Object.values(currentList);
    }

    const cotacao = currentList[index];
    
    if (cotacao.status === 'Aprovada' || cotacao.status === 'Concluída') {
        alert('Esta cotação já foi aprovada.');
        return;
    }

    const valorCotacao = parseFloat(removeCurrencyMask(String(cotacao.valor || '0')));
    const valorMensalidadeAtual = parseFloat(removeCurrencyMask(String(selectedClient.mensalidade || '0')));
    
    if (isNaN(valorCotacao)) {
        alert('Valor da cotação inválido.');
        return;
    }

    const novaMensalidade = valorMensalidadeAtual + valorCotacao;
    const novaMensalidadeStr = novaMensalidade.toFixed(2);

    const updatedCotacoes = [...currentList];
    updatedCotacoes[index] = { ...cotacao, status: 'Aprovada' };

    try {
        await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${selectedClient.id}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                cotacoes: updatedCotacoes,
                MENSALIDADE: novaMensalidadeStr
            })
        });

        const updatedClient = { 
            ...selectedClient, 
            cotacoes: updatedCotacoes,
            mensalidade: novaMensalidadeStr
        };
        
        setSelectedClient(updatedClient);
        setClientes(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        
        alert(`Cotação aprovada! Mensalidade atualizada para R$ ${novaMensalidadeStr.replace('.', ',')}`);
    } catch (error) {
        console.error("Erro ao aprovar cotação:", error);
        alert("Erro ao aprovar cotação.");
    }
  };

  const handleDeleteCotacao = async (index) => {
    if (!window.confirm('Tem certeza que deseja excluir esta cotação?')) return;

    let currentList = selectedClient.cotacoes || [];
    if (!Array.isArray(currentList)) {
        currentList = Object.values(currentList);
    }

    const newList = currentList.filter((_, i) => i !== index);

    try {
        await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${selectedClient.id}/cotacoes.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newList)
        });

        const updatedClient = { ...selectedClient, cotacoes: newList };
        setSelectedClient(updatedClient);
        setClientes(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        
        alert('Cotação excluída!');
    } catch (error) {
        console.error("Erro ao excluir cotação:", error);
        alert("Erro ao excluir cotação.");
    }
  };

  const handleNextStep = () => {
    if (addModalTab === 'dados') setAddModalTab('documentacao');
    else if (addModalTab === 'documentacao') setAddModalTab('plano');
  };

  const handlePrevStep = () => {
    if (addModalTab === 'plano') setAddModalTab('documentacao');
    else if (addModalTab === 'documentacao') setAddModalTab('dados');
  };

  // --- Funções para Adicionar Cliente ---
  const handleAddClientClick = () => {
    const currentUser = auth.currentUser;
    setNewClientData({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '', planoId: '', empresaId: '', tipo: 'Titular', valor: '', valorAdesao: '', vencimento: '', vendedor: currentUser ? currentUser.uid : '', status: 'Ativo', observacao: '', titularId: '' });
    setNewClientDocs({ rgCnh: '', comprovanteEndereco: '' });
    setPlanItems([]);
    setAddModalTab('dados');
    setAddModalOpen(true);
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClientData(prev => {
        const newData = { ...prev, [name]: value };
        // Auto-preenche adesão ao digitar mensalidade
        if (name === 'valor') newData.valorAdesao = value;
        return newData;
    });
  };

  const handleAddPlanItem = () => {
    if (tempPlanItem.descricao && tempPlanItem.valor) {
      setPlanItems([...planItems, { ...tempPlanItem, id: Date.now() }]);
      setTempPlanItem({ descricao: '', valor: '' });
    }
  };

  const handleRemovePlanItem = (id) => {
    setPlanItems(planItems.filter(item => item.id !== id));
  };

  const saveNewClient = async () => {
    if (newClientData.tipo === 'Dependente' && !newClientData.titularId) {
        alert('Para dependentes, é obrigatório selecionar um titular responsável.');
        return;
    }

    const clientPayload = {
      USUARIO: newClientData.nome,
      CPF: newClientData.cpf,
      'DATA NASC': newClientData.dataNascimento,
      TELEFONE: newClientData.telefone,
      EMAIL: newClientData.email,
      planoId: newClientData.planoId, // Salva o ID do plano
      CONTRATO: newClientData.tipo,
      empresaId: newClientData.empresaId,
      MENSALIDADE: removeCurrencyMask(newClientData.valor),
      ValorAdesao: removeCurrencyMask(newClientData.valorAdesao),
      VENCIMENTO: newClientData.vencimento,
      VENDEDOR: newClientData.vendedor,
      STATUS: newClientData.status,
      OBSERVACAO: newClientData.observacao,
      'ADESÃO': new Date().toLocaleDateString('pt-BR'),
      createdId: auth.currentUser ? auth.currentUser.uid : null,
      itensPlano: planItems.map(item => ({ ...item, valor: removeCurrencyMask(item.valor) })),
      documentos: newClientDocs,
      ...(newClientData.tipo === 'Dependente' && { titularId: newClientData.titularId }),
    };
    
    const selectedPlan = planos.find(p => p.id === newClientData.planoId);
    if (selectedPlan) clientPayload.PLANO = `${selectedPlan.Plano} - ${selectedPlan.Acomodação}`;

    try {
      const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload)
      });

      if (response.ok) {
        const { name } = await response.json();
        const newClientLocal = {
          id: name,
          nome: clientPayload.USUARIO,
          cpf: clientPayload.CPF,
          dataNascimento: clientPayload['DATA NASC'],
          mensalidade: clientPayload.MENSALIDADE,
          ValorAdesao: clientPayload.ValorAdesao,          
          planoId: clientPayload.planoId,
          telefone: clientPayload.TELEFONE,
          empresaId: clientPayload.empresaId,
          status: clientPayload.STATUS,
          vencimento: clientPayload.VENCIMENTO || '-'
        };
        setClientes(prev => [...prev, newClientLocal]);
        alert('Cliente adicionado com sucesso!');
        setAddModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente", error);
      alert("Erro ao salvar cliente");
    }
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const updatedData = {
      USUARIO: formData.get('nome'),
      CPF: formData.get('cpf'),
      'DATA NASC': formData.get('dataNascimento'),
      TELEFONE: formData.get('telefone'),
      planoId: formData.get('planoId'), // Salva o ID do plano
      MENSALIDADE: removeCurrencyMask(formData.get('mensalidade')),
      ValorAdesao: removeCurrencyMask(formData.get('ValorAdesao')),
      VENCIMENTO: formData.get('vencimento'),
      EMAIL: formData.get('email'),
      STATUS: formData.get('status'),
      CONTRATO: formData.get('contratoTipo'),
      VENDEDOR: formData.get('vendedor'),
      empresaId: formData.get('empresaId'),
      OBSERVACAO: formData.get('observacao')
    };

    const selectedPlan = planos.find(p => p.id === updatedData.planoId);
    if (selectedPlan) updatedData.PLANO = `${selectedPlan.Plano} - ${selectedPlan.Acomodação}`;

    // Se o status mudou para 'Ativo' e não tem data de adesão, define a data atual
    if (updatedData.STATUS === 'Ativo' && selectedClient.status !== 'Ativo' && !selectedClient.dataCadastro) {
        updatedData['ADESÃO'] = new Date().toLocaleDateString('pt-BR');
    } else if (selectedClient.dataCadastro) {
        updatedData['ADESÃO'] = selectedClient.dataCadastro; // Mantém a data existente
    }

    try {
      const response = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${selectedClient.id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        setClientes(prev => prev.map(c => c.id === selectedClient.id ? {
          ...c,
          nome: updatedData.USUARIO,
          cpf: updatedData.CPF,
          dataNascimento: updatedData['DATA NASC'],
          telefone: updatedData.TELEFONE,
          planoId: updatedData.planoId,
          empresaId: updatedData.empresaId,
          mensalidade: updatedData.MENSALIDADE,
          ValorAdesao: updatedData.ValorAdesao,
          vencimento: updatedData.VENCIMENTO,
          email: updatedData.EMAIL,
          status: updatedData.STATUS,
          contratoTipo: updatedData.CONTRATO,
          vendedor: updatedData.VENDEDOR,
          observacao: updatedData.OBSERVACAO,
          dataCadastro: updatedData['ADESÃO'] || selectedClient.dataCadastro
        } : c));
        alert('Cliente atualizado com sucesso!');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao salvar alterações.');
    }
  };

  const renderTabContent = () => {
    if (!selectedClient) return null;

    switch (activeTab) {
      case 'dados':
        return (
          <form className="profile-form" onSubmit={handleSaveClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Nome Completo</label><input type="text" name="nome" value={selectedClient.nome || ''} onChange={handleEditChange} style={{ width: '100%' }} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>E-mail</label><input type="email" name="email" value={selectedClient.email || ''} onChange={handleEditChange} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>CPF</label><input type="text" name="cpf" value={selectedClient.cpf || ''} onChange={(e) => { e.target.value = maskCPF(e.target.value); handleEditChange(e); }} maxLength="14" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Data de Nascimento {selectedClient.dataNascimento && <span style={{color: '#007bff', fontWeight: 'normal'}}>({calculateAge(selectedClient.dataNascimento)} anos)</span>}</label><input type="text" name="dataNascimento" value={selectedClient.dataNascimento || ''} onChange={(e) => { e.target.value = maskDate(e.target.value); handleEditChange(e); }} maxLength="10" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Telefone</label><input type="tel" name="telefone" value={selectedClient.telefone || ''} onChange={(e) => { e.target.value = maskPhone(e.target.value); handleEditChange(e); }} maxLength="15" style={{ width: '100%' }} /></div>
            <div className="form-group">
              <label>Plano</label>
              <select name="planoId" value={selectedClient.planoId || ''} onChange={handleEditChange} style={{ width: '100%' }}>
                  <option value="">Selecione um plano...</option>
                  {planos.map(p => <option key={p.id} value={p.id}>{p.Plano} - {p.Acomodação}</option>)}
                  {/* Lógica para exibir o plano antigo se não estiver na lista de ativos */}
                  {!planos.some(p => p.id === selectedClient.planoId) && selectedClient.plano && (<option value={selectedClient.planoId}>{selectedClient.plano} (Inativo/Personalizado)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Empresa</label>
              <select name="empresaId" value={selectedClient.empresaId || ''} onChange={handleEditChange} style={{ width: '100%' }}>
                  <option value="">Nenhuma</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nomeFantasia || e.razaoSocial}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Mensalidade</label><input type="text" name="mensalidade" value={maskCurrency(String(selectedClient.mensalidade))} onChange={(e) => { e.target.value = maskCurrency(e.target.value); handleEditChange(e); }} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Valor Adesão</label><input type="text" name="ValorAdesao" value={maskCurrency(String(selectedClient.ValorAdesao || selectedClient.mensalidade || ''))} onChange={(e) => { e.target.value = maskCurrency(e.target.value); handleEditChange(e); }} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Dia de Vencimento</label>
              <select name="vencimento" value={selectedClient.vencimento} onChange={handleEditChange} style={{ width: '100%' }}>
                  <option value="">Selecione</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Data de Adesão</label><input type="text" name="dataCadastro" value={selectedClient.dataCadastro || ''} disabled style={{ width: '100%', backgroundColor: '#f0f0f0' }} /></div>
            <div className="form-group"><label>Tipo</label>
              <select name="contratoTipo" defaultValue={selectedClient.contratoTipo} style={{ width: '100%' }}>
                <option value="Titular">Titular</option>
                <option value="Dependente">Dependente</option>
              </select>
            </div>
            <div className="form-group"><label>Vendedor</label>
              <select name="vendedor" defaultValue={selectedClient.vendedor} style={{ width: '100%' }}>
                <option value="">Selecione...</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group"><label>Status</label>
              <select name="status" defaultValue={selectedClient.status} style={{ width: '100%' }}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Contato">Contato</option>
                <option value="Cotação">Cotação</option>
                <option value="Pendente">Pendente</option>
                <option value="Pré-Cancelamento">Pré-Cancelamento</option>
                <option value="INCLUSÃO">Inclusão</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observação</label>
              <textarea name="observacao" value={selectedClient.observacao} onChange={handleEditChange} style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
            <div className="popup-actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-start', paddingTop: '10px' }}>
              <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        );
      case 'documentos':
        return (
            <div className="form-grid">
                <div className="form-group">
                    <label>Adicionar Documento</label>
                    <input type="file" onChange={(e) => handleFileUpload(e, 'documentos')} />
                </div>
                {selectedClient.documentos && (
                    <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
                        {(Array.isArray(selectedClient.documentos) ? selectedClient.documentos : Object.values(selectedClient.documentos)).map((doc, idx) => (
                            <li key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaFileAlt style={{ color: '#666' }} />
                                <button onClick={() => handleDownloadFile(doc)} style={{ textDecoration: 'none', color: '#007bff', flex: 1, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                                    {doc.nome}
                                </button>
                                <small style={{ color: '#999' }}>{doc.data}</small>
                                <button onClick={() => handleFileDelete(idx, 'documentos')} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
      case 'contratos':
        return (
            <div className="form-grid">
                <div className="form-group">
                    <label>Adicionar Contrato</label>
                    <input type="file" onChange={(e) => handleFileUpload(e, 'contratos')} />
                </div>
                {selectedClient.contratos && (
                    <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
                        {(Array.isArray(selectedClient.contratos) ? selectedClient.contratos : Object.values(selectedClient.contratos)).map((doc, idx) => (
                            <li key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaFileContract style={{ color: '#666' }} />
                                <button onClick={() => handleDownloadFile(doc)} style={{ textDecoration: 'none', color: '#007bff', flex: 1, background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                                    {doc.nome}
                                </button>
                                <small style={{ color: '#999' }}>{doc.data}</small>
                                <button onClick={() => handleFileDelete(idx, 'contratos')} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                                    <FaTrash />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
      case 'cotacoes':
        return (
            <div className="form-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>Nova Cotação</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                            <input 
                                placeholder="Descrição (ex: Seguro Auto)" 
                                value={newCotacao.descricao} 
                                onChange={(e) => setNewCotacao({...newCotacao, descricao: e.target.value})}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <input 
                                placeholder="Valor (R$)" 
                                value={newCotacao.valor} 
                                onChange={(e) => setNewCotacao({...newCotacao, valor: maskCurrency(e.target.value)})}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <select 
                                value={newCotacao.status} 
                                onChange={(e) => setNewCotacao({...newCotacao, status: e.target.value})}
                                style={{ width: '100%' }}
                            >
                                <option value="Em Análise">Em Análise</option>
                                <option value="Concluída">Concluída</option>
                                <option value="Rejeitada">Rejeitada</option>
                            </select>
                        </div>
                        <button type="button" onClick={handleAddCotacao} className="btn btn-primary" style={{ height: '42px' }}><FaPlus /></button>
                    </div>
                </div>
                
                <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <table className="historico-tabela">
                        <thead><tr><th>Descrição</th><th>Valor</th><th>Status</th><th>Data</th><th>Ação</th></tr></thead>
                        <tbody>
                            {(Array.isArray(selectedClient.cotacoes) ? selectedClient.cotacoes : Object.values(selectedClient.cotacoes || {})).map((cot, idx) => (
                                <tr key={idx}>
                                    <td>{cot.descricao}</td>
                                    <td>{cot.valor}</td>
                                    <td>{cot.status}</td>
                                    <td>{cot.data}</td>
                                    <td>
                                        {cot.status !== 'Aprovada' && cot.status !== 'Concluída' && (
                                            <button onClick={() => handleApproveCotacao(idx)} title="Aprovar e Adicionar à Mensalidade" style={{ background: 'none', border: 'none', color: 'green', cursor: 'pointer', marginRight: '10px' }}>
                                                <FaCheck />
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteCotacao(idx)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  const renderAddModalContent = () => {
    switch(addModalTab) {
      case 'dados':
        return (
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Cliente</label><input name="nome" value={newClientData.nome} onChange={handleNewClientChange} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>CPF</label><input name="cpf" value={newClientData.cpf} onChange={(e) => { e.target.value = maskCPF(e.target.value); handleNewClientChange(e); }} maxLength="14" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Data de Nascimento {newClientData.dataNascimento && <span style={{color: '#007bff', fontWeight: 'normal'}}>({calculateAge(newClientData.dataNascimento)} anos)</span>}</label><input name="dataNascimento" value={newClientData.dataNascimento} onChange={(e) => { e.target.value = maskDate(e.target.value); handleNewClientChange(e); }} maxLength="10" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Telefone</label><input name="telefone" value={newClientData.telefone} onChange={(e) => { e.target.value = maskPhone(e.target.value); handleNewClientChange(e); }} maxLength="15" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Email</label><input name="email" value={newClientData.email} onChange={handleNewClientChange} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Mensalidade</label><input name="valor" value={newClientData.valor} onChange={(e) => { e.target.value = maskCurrency(e.target.value); handleNewClientChange(e); }} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Valor Adesão</label><input name="valorAdesao" value={newClientData.valorAdesao} onChange={(e) => { e.target.value = maskCurrency(e.target.value); handleNewClientChange(e); }} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Dia de Vencimento</label>
              <select name="vencimento" value={newClientData.vencimento} onChange={handleNewClientChange} style={{ width: '100%' }}>
                  <option value="">Selecione</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Plano</label>
              <select name="planoId" value={newClientData.planoId} onChange={handleNewClientChange} style={{ width: '100%' }}>
                  <option value="">Selecione um plano...</option>
                  {planos.map(p => <option key={p.id} value={p.id}>{p.Plano} - {p.Acomodação}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Empresa</label>
              <select name="empresaId" value={newClientData.empresaId} onChange={handleNewClientChange} style={{ width: '100%' }}>
                  <option value="">Nenhuma</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nomeFantasia || e.razaoSocial}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Tipo</label>
              <select name="tipo" value={newClientData.tipo} onChange={handleNewClientChange} style={{ width: '100%' }}>
                <option value="Titular">Titular</option>
                <option value="Dependente">Dependente</option>
              </select>
            </div>
            {newClientData.tipo === 'Dependente' && (
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Titular Responsável</label>
                <select name="titularId" value={newClientData.titularId} onChange={handleNewClientChange} style={{ width: '100%' }} required>
                  <option value="">Selecione o titular...</option>
                  {clientes.filter(c => c.contratoTipo === 'Titular' && c.status === 'Ativo').map(titular => (
                    <option key={titular.id} value={titular.id}>{titular.nome} - CPF: {titular.cpf}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group"><label>Vendedor</label>
              <select name="vendedor" value={newClientData.vendedor} onChange={handleNewClientChange} style={{ width: '100%' }}>
                <option value="">Selecione...</option>
                {vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group"><label>Classificação</label>
              <select name="status" value={newClientData.status} onChange={handleNewClientChange} style={{ width: '100%' }}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Contato">Contato</option>
                <option value="Cotação">Cotação</option>
                <option value="Pendente">Pendente</option>
                <option value="Pré-Cancelamento">Pré-Cancelamento</option>
                <option value="INCLUSÃO">Inclusão</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Observação</label>
              <textarea name="observacao" value={newClientData.observacao} onChange={handleNewClientChange} style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }} />
            </div>
          </div>
        );
      case 'documentacao':
        return (
          <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group"><label>RG ou CNH</label><input type="file" onChange={(e) => handleFileChange(e, 'rgCnh')} /></div>
            <div className="form-group"><label>Comprovante de Endereço</label><input type="file" onChange={(e) => handleFileChange(e, 'comprovanteEndereco')} /></div>
          </div>
        );
      case 'plano':
        return (
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}><label>Descrição</label><input value={tempPlanItem.descricao} onChange={(e) => setTempPlanItem({...tempPlanItem, descricao: e.target.value})} style={{ width: '100%' }} /></div>
              <div className="form-group" style={{ width: '150px' }}><label>Valor</label><input value={tempPlanItem.valor} onChange={(e) => setTempPlanItem({...tempPlanItem, valor: maskCurrency(e.target.value)})} style={{ width: '100%' }} /></div>
              <button type="button" className="btn btn-primary" onClick={handleAddPlanItem} style={{ marginBottom: '2px', height: '38px' }}><FaPlus /> Adicionar</button>
            </div>
            <table className="historico-tabela">
              <thead><tr><th>Descrição</th><th>Valor</th><th>Ação</th></tr></thead>
              <tbody>
                {planItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.descricao}</td>
                    <td>{item.valor}</td>
                    <td><button onClick={() => handleRemovePlanItem(item.id)} className="btn-remove-faq" style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default: return null;
    }
  };

  const handleGenerateLink = () => {
    const user = auth.currentUser;
    if (!user) {
        alert("Você precisa estar logado para gerar o link.");
        return;
    }

    // Tenta encontrar o nome do vendedor na lista carregada
    const currentVendedor = vendedores.find(v => v.id === user.uid);
    const vendedorNome = currentVendedor ? currentVendedor.nome : (user.displayName || 'Consultor');
    
    // Monta a URL (assume que a rota /cadastro-externo existe)
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/cadastro-externo?vendedorId=${user.uid}&vendedorNome=${encodeURIComponent(vendedorNome)}`;

    navigator.clipboard.writeText(link).then(() => {
        alert("Link de cadastro copiado para a área de transferência!");
    });
  };

  return (
    <>
      <div className="profile-section">
        <h2 className="faturas-section-title">Gerenciamento de Clientes</h2>
        
        <div className="tabs-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button className={`btn-tab ${listTab === 'ativos' ? 'active' : ''}`} onClick={() => setListTab('ativos')}><FaCheckCircle /> Ativos</button>
          <button className={`btn-tab ${listTab === 'inativos' ? 'active' : ''}`} onClick={() => setListTab('inativos')}><FaExclamationCircle /> Inativos</button>
          <button className={`btn-tab ${listTab === 'contatos' ? 'active' : ''}`} onClick={() => setListTab('contatos')}><FaList /> Contatos</button>
          <button className={`btn-tab ${listTab === 'cotacoes' ? 'active' : ''}`} onClick={() => setListTab('cotacoes')}><FaQuoteRight /> Cotações</button>
          <button className={`btn-tab ${listTab === 'pre-cancelamento' ? 'active' : ''}`} onClick={() => setListTab('pre-cancelamento')} style={{ color: '#dc3545' }}><FaExclamationTriangle /> Pré-Cancelamento</button>
          <button className={`btn-tab ${listTab === 'inclusao' ? 'active' : ''}`} onClick={() => setListTab('inclusao')} style={{ position: 'relative' }}>
            <FaUserPlus /> Inclusão
            {inclusaoCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#dc3545',
                color: '#fff',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                {inclusaoCount}
              </span>
            )}
          </button>
        </div>

        <div className="filtros-clientes" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="filtro-input"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleAddClientClick} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaPlus /> Adicionar Cliente
          </button>
          <button className="btn btn-secondary" onClick={handleGenerateLink} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#17a2b8', borderColor: '#17a2b8', color: '#fff' }}>
            <FaLink /> Link de Cadastro
          </button>
          
          {currentUserRole === 'Admin' && (
            <button className="btn btn-secondary" onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FaFilter /> {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
            </button>
          )}
        </div>

        {showFilters && currentUserRole === 'Admin' && (
            <div className="advanced-filters" style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', border: '1px solid #e9ecef' }}>
                <div className="form-group">
                    <label>Vendedor</label>
                    <select name="vendedor" value={filters.vendedor} onChange={handleFilterChange}>
                        <option value="">Todos</option>
                        {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Idade (Anos)</label>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <input type="number" name="idadeMin" placeholder="Min" value={filters.idadeMin} onChange={handleFilterChange} />
                        <input type="number" name="idadeMax" placeholder="Max" value={filters.idadeMax} onChange={handleFilterChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Permanência (Meses)</label>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <input type="number" name="tempoMin" placeholder="Min" value={filters.tempoMin} onChange={handleFilterChange} />
                        <input type="number" name="tempoMax" placeholder="Max" value={filters.tempoMax} onChange={handleFilterChange} />
                    </div>
                </div>
                <div className="form-group">
                    <label>Plano</label>
                    <select name="plano" value={filters.plano} onChange={handleFilterChange}>
                        <option value="">Todos</option>
                        {uniquePlansForFilter.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>
        )}

        <div className="table-container">
          <table className="historico-tabela">
            <thead>
              <tr>
                <th>Usuário</th><th>CPF</th><th>Telefone</th><th>Mensalidade</th><th>Vencimento</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                  <td>{cliente.telefone}</td>
                  <td>{maskCurrency(String(cliente.mensalidade))}</td>
                  <td>{cliente.vencimento !== '-' ? `Dia ${cliente.vencimento}` : '-'}</td>
                  <td>
                    <button onClick={() => handleGerenciarClick(cliente)} className="btn-gerenciar">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedClient && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={handleCloseModal} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Gerenciando Cliente</h3>
              <h2>{selectedClient.nome}</h2>
            </div>

            <nav className="cliente-modal-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={() => setActiveTab('dados')} className={activeTab === 'dados' ? 'active' : ''}><FaEdit /> Dados Pessoais</button>
              <button onClick={() => setActiveTab('documentos')} className={activeTab === 'documentos' ? 'active' : ''}><FaFileAlt /> Documentação</button>
              <button onClick={() => setActiveTab('contratos')} className={activeTab === 'contratos' ? 'active' : ''}><FaFileContract /> Contratos</button>
              <button onClick={() => setActiveTab('cotacoes')} className={activeTab === 'cotacoes' ? 'active' : ''}><FaQuoteRight /> Cotações</button>
            </nav>

            <div className="cliente-modal-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setAddModalOpen(false)} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Novo Cadastro</h3>
              <h2>Adicionar Cliente</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div style={{ color: addModalTab === 'dados' ? '#007bff' : '#ccc', fontWeight: addModalTab === 'dados' ? 'bold' : 'normal' }}>1. Dados Cadastrais</div>
                <div style={{ color: '#ccc' }}>&gt;</div>
                <div style={{ color: addModalTab === 'documentacao' ? '#007bff' : '#ccc', fontWeight: addModalTab === 'documentacao' ? 'bold' : 'normal' }}>2. Documentação</div>
                <div style={{ color: '#ccc' }}>&gt;</div>
                <div style={{ color: addModalTab === 'plano' ? '#007bff' : '#ccc', fontWeight: addModalTab === 'plano' ? 'bold' : 'normal' }}>3. Plano</div>
            </div>

            <div className="cliente-modal-content" style={{ marginTop: '20px' }}>
              {renderAddModalContent()}
            </div>
            <div className="popup-actions" style={{ marginTop: '20px', justifyContent: 'space-between' }}>
              {addModalTab === 'dados' ? 
                <button onClick={() => setAddModalOpen(false)} className="btn btn-secondary">Cancelar</button> :
                <button onClick={handlePrevStep} className="btn btn-secondary">Voltar</button>
              }
              {addModalTab === 'plano' ? 
                <button onClick={saveNewClient} className="btn btn-primary">Salvar Cliente</button> :
                <button onClick={handleNextStep} className="btn btn-primary">Próximo</button>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Clientes;