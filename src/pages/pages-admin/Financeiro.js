import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowDown, FaWallet, FaExclamationCircle, FaCheckCircle, FaClock, FaList, FaFileInvoiceDollar, FaBell, FaCheck, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaWhatsapp, FaEdit, FaTrash, FaPlus, FaEnvelope, FaBarcode, FaQrcode, FaFilter, FaSync, FaChartPie, FaSpinner, FaHandHoldingUsd, FaRobot } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Financeiro = () => {
  // --- Dados Mockados para Exemplo ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rawData, setRawData] = useState({ clientes: {}, cobrancas: {}, equipe: {} });
  const [transacoes, setTransacoes] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainTab, setMainTab] = useState('dashboard'); // 'dashboard' ou 'cobrancas'
  const [filterTab, setFilterTab] = useState('todos');
  const [metrics, setMetrics] = useState({
    custoTotal: 5000, // Custo total fixo como exemplo
    receitaMensal: 0,
    atrasoVal: 0,
    atrasoCount: 0,
    pagosVal: 0,
    pagosCount: 0
  });
  const [userRole, setUserRole] = useState(null);

  // Estados para Nova Cobrança
  const [isModalOpen, setModalOpen] = useState(false);
  const [newCharge, setNewCharge] = useState({ cliente: '', descricao: '', valor: '', vencimento: '', status: 'Pendente', cpf: '', email: '' });
  // Estado para o Modal PIX
  const [pixModalData, setPixModalData] = useState({ isOpen: false, code: '', whatsAppUrl: '', clientName: '', phone: '', message: '', type: 'pix', boletoUrl: '' });

  // Estado para Modal de Confirmação de Pagamento
  const [confirmPaymentModal, setConfirmPaymentModal] = useState({ isOpen: false, trx: null, isPaidOnline: false, detectedMethod: null });

  // Estado para Modal de Seleção de Pagamento
  const [paymentSelectionModal, setPaymentSelectionModal] = useState({ isOpen: false, trx: null });

  // Estados para Edição de Pagamento
  const [isEditPaymentModalOpen, setEditPaymentModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [editMensalidade, setEditMensalidade] = useState('');
  const [editVencimento, setEditVencimento] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterTipo, setFilterTipo] = useState('');
  const [filterVencimento, setFilterVencimento] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  // Estados para Automação de Cobrança
  const [isAutomationModalOpen, setAutomationModalOpen] = useState(false);
  const [automationConfig, setAutomationConfig] = useState({
    active: false,
    daysBefore: 3,
    sendOnDueDate: true,
    frequencyAfter: 5 // A cada X dias após vencimento
  });

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

  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskDate = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  };

  // Função robusta para converter valores monetários (R$ 1.200,00 ou 1200.00) para float
  const parseMonetaryValue = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const str = String(value).trim();
    if (str.includes(',')) {
        // Formato Brasileiro: remove pontos de milhar e troca vírgula por ponto
        return parseFloat(str.replace(/[R$\s.]/g, '').replace(',', '.'));
    }
    // Formato Americano/Padrão: apenas remove R$ e espaços
    return parseFloat(str.replace(/[R$\s]/g, ''));
  };

  const fetchTransacoes = async () => {
      try {
        // Busca Clientes (Assinaturas), Cobranças Avulsas e Equipe em paralelo
        const [resClientes, resCobrancas, resEquipe] = await Promise.all([
          fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json'),
          fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/cobrancas.json'),
          fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe.json')
        ]);

        if (!resClientes.ok || !resCobrancas.ok || !resEquipe.ok) {
            throw new Error('Falha ao buscar dados: Acesso negado (401). Verifique as regras do Database.');
        }

        const dataClientes = await resClientes.json();
        const dataCobrancas = await resCobrancas.json();
        const dataEquipe = await resEquipe.json();

        setRawData({
            clientes: dataClientes?.Clientes || dataClientes || {},
            cobrancas: dataCobrancas || {},
            equipe: dataEquipe || {}
        });
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
      }
    };


  useEffect(() => {
    fetchTransacoes();
  }, []);

  // Busca configurações de automação
  useEffect(() => {
    const fetchAutomationConfig = async () => {
        try {
            const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/automacoes_cobranca.json');
            const data = await response.json();
            if (data) setAutomationConfig(data);
        } catch (error) {
            console.error("Erro ao buscar configurações de automação:", error);
        }
    };
    fetchAutomationConfig();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${user.uid}.json`);
          const data = await response.json();
          if (data && data.cargo) {
            setUserRole(data.cargo);
            if (data.cargo === 'Financeiro') {
              setMainTab('cobrancas');
            }
          }
        } catch (error) {
          console.error("Erro ao buscar cargo:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      const processData = () => {
          const { clientes: clientesData, cobrancas: cobrancasData, equipe: equipeData } = rawData;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const selectedMonth = currentDate.getMonth();
          const selectedYear = currentDate.getFullYear();

          let receitaMensal = 0;
          let atrasoVal = 0;
          let atrasoCount = 0;
          let pagosVal = 0;
          let pagosCount = 0;

          // Step 1: Pre-process clients to calculate total fees for holders and identify dependents
          const holderData = {};
          const dependentIds = new Set();

          if (clientesData) {
              // Initialize holders with their own data and prepare for aggregation
              Object.keys(clientesData).forEach(key => {
                  const cliente = clientesData[key];
                  if (cliente && cliente.CONTRATO === 'Titular') {
                      holderData[key] = {
                          ...cliente,
                          id: key,
                          mensalidadeTotal: parseMonetaryValue(cliente.MENSALIDADE),
                          numDependentes: 0
                      };
                  }
              });

              // Add dependent fees to holders and mark dependents
              Object.keys(clientesData).forEach(key => {
                  const cliente = clientesData[key];
                  if (cliente && cliente.CONTRATO === 'Dependente' && cliente.titularId) {
                      dependentIds.add(key);
                      const holder = holderData[cliente.titularId];
                      if (holder) {
                          holder.mensalidadeTotal += parseMonetaryValue(cliente.MENSALIDADE);
                          holder.numDependentes += 1;
                      }
                  }
              });
          }

          // Inicializa mapa de comissões com a equipe
          const comissoesMap = {};
          if (equipeData) {
              Object.keys(equipeData).forEach(uid => {
                  comissoesMap[uid] = {
                      nome: equipeData[uid].nome || 'Vendedor',
                      total: 0,
                      vendas: 0,
                      detalhes: []
                  };
              });
          }

          // Processa Assinaturas (Clientes)
          const loadedTransacoes = Object.keys(clientesData)
            .filter(key => !dependentIds.has(key)) // Filter out dependents
            .map(key => {
              const item = clientesData[key];
              if (!item) return null;

              // For holders, use the aggregated data. For others, use their own data.
              const isHolder = item.CONTRATO === 'Titular' && holderData[key];
              const valor = isHolder ? holderData[key].mensalidadeTotal : parseMonetaryValue(item.MENSALIDADE);
              const numDependents = isHolder ? holderData[key].numDependentes : 0;
              const descricao = numDependents > 0 ? `${item.USUARIO} (+${numDependents} dep.)` : item.USUARIO;

            // Normalização de Data (Trata M/D/Y e D/M/Y)
            // Para assinaturas, projetamos a data de vencimento para o mês selecionado
            let day = 1;

            if (item.VENCIMENTO) { 
                const vencimentoStr = String(item.VENCIMENTO);
                if (vencimentoStr.includes('/')) {
                    const parts = vencimentoStr.split('/');
                    if (parts.length === 3) {
                        day = parseInt(parts[0], 10);
                        // Se o "mês" for maior que 12, assume-se que é o dia (formato M/D/Y vindo do banco)
                        const monthPart = parseInt(parts[1], 10);
                        if (monthPart > 12) { day = monthPart; }
                    }
                } else if (!isNaN(parseInt(vencimentoStr))) {
                    day = parseInt(vencimentoStr, 10);
                } 
            }
            
            const vencimentoDate = new Date(selectedYear, selectedMonth, day);

            // Verifica pagamento no histórico (array dataPagamento)
            const dataPagamentoArr = item.dataPagamento ? (Array.isArray(item.dataPagamento) ? item.dataPagamento : Object.values(item.dataPagamento)) : [];
            const monthName = vencimentoDate.toLocaleString('pt-BR', { month: 'long' });
            
            // Normalização para evitar erros com acentos (ex: "março" vs "marco")
            const normalizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
            const paidEntry = dataPagamentoArr.find(entry => 
                typeof entry === 'string' && 
                normalizeStr(entry).startsWith(normalizeStr(monthName))
            );

            let status = 'Pendente';
            let dataPagamentoDisplay = '-';
            let formaPagamento = '-';

            if (paidEntry) {
                status = 'Pago';
                const parts = paidEntry.split(':');
                if (parts.length > 1) {
                    const valParts = parts[1].trim().split(' - ');
                    dataPagamentoDisplay = valParts[0];
                    if (valParts.length > 1) formaPagamento = valParts[1];
                }
            } else if (vencimentoDate) {
                if (vencimentoDate < today) status = 'Atrasado';
                else status = 'A Vencer';
            }

            // Metrics Calculation
            if (vencimentoDate) {
                receitaMensal += valor;
            }
            if (status === 'Atrasado') {
                atrasoVal += valor;
                atrasoCount++;
            }
            if (status === 'Pago') {
                pagosVal += valor;
                pagosCount++;
            }

            const diaVencimento = vencimentoDate ? String(vencimentoDate.getDate()).padStart(2, '0') : '-';

            if (status === 'Pago' && formaPagamento === '-') {
                formaPagamento = item.transactionId ? 'Pix Copia e Cola' : 'Dinheiro/Outros';
            }

            // Lógica de Comissões (Atualizada):
            // Considera apenas o PRIMEIRO pagamento do histórico (index 0) para comissão
            const vendedorId = item.VENDEDOR;
            if (vendedorId && dataPagamentoArr.length > 0) {
                const firstPayment = dataPagamentoArr[0];
                if (typeof firstPayment === 'string') {
                    // Extrai a data. Ex: "fevereiro: 25/02/2026 - Pix"
                    let dateStr = '';
                    if (firstPayment.includes(':')) {
                        const parts = firstPayment.split(':');
                        if (parts.length > 1) {
                            dateStr = parts[1].split('-')[0].trim();
                        }
                    } else {
                        dateStr = firstPayment.split('-')[0].trim();
                    }
                    
                    const dateParts = dateStr.split('/');
                    if (dateParts.length === 3) {
                        const month = parseInt(dateParts[1], 10) - 1;
                        const year = parseInt(dateParts[2], 10);

                        if (month === selectedMonth && year === selectedYear) {
                            if (!comissoesMap[vendedorId]) {
                                comissoesMap[vendedorId] = {
                                    nome: 'Vendedor (ID: ' + vendedorId + ')',
                                    total: 0,
                                    vendas: 0,
                                    detalhes: []
                                };
                            }
                            
                            comissoesMap[vendedorId].total += valor;
                            comissoesMap[vendedorId].vendas += 1;
                            comissoesMap[vendedorId].detalhes.push({
                                cliente: item.USUARIO,
                                valor: valor,
                                data: dateStr
                            });
                        }
                    }
                }
            }

            return {
              id: key,
              descricao: descricao,
              cpf: item.CPF ? String(item.CPF) : '',
              valor: valor,
              valorFormatado: `R$ ${valor.toFixed(2).replace('.', ',')}`,
              tipo: item.CONTRATO,
              data: diaVencimento,
              dataObj: vencimentoDate,
              dataPagamento: dataPagamentoDisplay,
              status: status,
              origem: 'assinatura',
              telefone: item.TELEFONE,
              email: item.EMAIL || '',
              transactionId: item.transactionId,
              formaPagamento
            };
          }).filter(item => item !== null);

          // Processa Cobranças Avulsas
          const loadedCobrancas = Object.keys(cobrancasData).map(key => {
            const item = cobrancasData[key];
            const valor = parseMonetaryValue(item.valor);
            
            let vencimentoDate = null;
            if (item.vencimento) {
               const parts = item.vencimento.split('-'); // Formato YYYY-MM-DD do input date
               if (parts.length === 3) {
                 vencimentoDate = new Date(parts[0], parts[1] - 1, parts[2]);
               }
            }

            // Recalcula status se não for 'Pago'
            let status = item.status;
            if (status !== 'Pago' && vencimentoDate) {
                if (vencimentoDate < today) status = 'Atrasado';
                else status = 'Pendente'; // ou 'A Vencer'
            }

            if (vencimentoDate && vencimentoDate.getMonth() === selectedMonth && vencimentoDate.getFullYear() === selectedYear) {
                receitaMensal += valor;
            }
            if (status === 'Atrasado') {
                atrasoVal += valor;
                atrasoCount++;
            }
            if (status === 'Pago') {
                pagosVal += valor;
                pagosCount++;
            }

            // Filtra apenas cobranças do mês selecionado
            if (!vencimentoDate || vencimentoDate.getMonth() !== selectedMonth || vencimentoDate.getFullYear() !== selectedYear) {
                return null;
            }

            const diaVencimento = vencimentoDate ? String(vencimentoDate.getDate()).padStart(2, '0') : '-';

            let formaPagamento = item.formaPagamento || '-';
            if (status === 'Pago' && formaPagamento === '-') {
                formaPagamento = item.transactionId ? 'Pix Copia e Cola' : 'Dinheiro/Outros';
            }

            return {
              id: key,
              descricao: `${item.descricao} - ${item.cliente}`,
              cpf: item.cpf || '',
              valor: valor,
              valorFormatado: `R$ ${valor.toFixed(2).replace('.', ',')}`,
              tipo: 'Cobrança Avulsa',
              data: diaVencimento,
              dataObj: vencimentoDate,
              dataPagamento: item.dataPagamento || '-',
              status: status,
              origem: 'avulsa',
              email: item.email || '',
              transactionId: item.transactionId,
              formaPagamento
            };
          }).filter(item => item !== null);

          // Combina e ordena por data
          const todasTransacoes = [...loadedTransacoes, ...loadedCobrancas].sort((a, b) => {
             const diaA = a.dataObj ? a.dataObj.getDate() : 32;
             const diaB = b.dataObj ? b.dataObj.getDate() : 32;
             return diaA - diaB; // Ordena pelo dia do mês (crescente)
          });

          setTransacoes(todasTransacoes);
          setComissoes(Object.values(comissoesMap));
          setMetrics(prev => ({
            ...prev,
            receitaMensal,
            atrasoVal,
            atrasoCount,
            pagosVal,
            pagosCount
          }));
      };

      processData();
  }, [rawData, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
        let matchesTab = true;
        if (filterTab === 'atraso') matchesTab = t.status === 'Atrasado';
        else if (filterTab === 'pagos') matchesTab = t.status === 'Pago';
        else if (filterTab === 'a_vencer') matchesTab = t.status === 'A Vencer' || t.status === 'Pendente';
        
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = t.descricao.toLowerCase().includes(searchLower) || 
                              (t.cpf && String(t.cpf).toLowerCase().includes(searchLower));

        const matchesTipo = filterTipo === '' || t.tipo === filterTipo;

        let matchesVencimento = true;
        if (filterVencimento) {
            const [y, m, d] = filterVencimento.split('-').map(Number);
            if (t.dataObj) {
                matchesVencimento = t.dataObj.getFullYear() === y && 
                                    t.dataObj.getMonth() === (m - 1) && 
                                    t.dataObj.getDate() === d;
            } else {
                matchesVencimento = false;
            }
        }

        return matchesTab && matchesSearch && matchesTipo && matchesVencimento;
    });
  }, [transacoes, filterTab, searchTerm, filterTipo, filterVencimento]);

  
  // --- Funções de Ação ---

  // URL base das Cloud Functions do Firebase (Substitua pela URL do seu projeto)
  const CLOUD_FUNCTIONS_BASE = 'https://us-central1-lavoro-servicos-c10fd.cloudfunctions.net';

  // Criação de cobrança PIX com split via Backend (Firebase Functions)
  const createPagarmeOrder = async (charge, method = 'pix') => {
    console.log(`Solicitando criação de ${method.toUpperCase()} ao backend:`, charge);
    
    // Validação de segurança para o valor
    const amountInCents = Math.round(charge.valor * 100);
    if (isNaN(amountInCents) || amountInCents <= 0) {
        alert("Valor da cobrança inválido ou zerado. Verifique o cadastro.");
        throw new Error("Valor inválido para geração de cobrança.");
    }

    // 1. Extrai o nome do cliente e a descrição da cobrança de forma consistente
    const nameParts = charge.descricao.split(' - ');
    const customerName = nameParts.length > 1 ? nameParts[nameParts.length - 1].trim() : charge.descricao.trim();
    const itemDescription = charge.origem === 'assinatura' 
        ? `Mensalidade plano ${charge.tipo || ''} - ${customerName}`
        : nameParts[0].trim();

    // 2. Formata o telefone para o padrão E.164 com código de país
    let phoneNumber = charge.telefone ? String(charge.telefone).replace(/\D/g, '') : '';
    if (phoneNumber && !phoneNumber.startsWith('55') && (phoneNumber.length === 10 || phoneNumber.length === 11)) {
        phoneNumber = '55' + phoneNumber;
    }
    if (!phoneNumber) phoneNumber = '5511999999999'; // Fallback
    
    try {
        const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/createPagarmeSplitOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amountInCents, // Valor em centavos validado
                description: itemDescription,
                payment_method: method,
                customer: {
                    name: customerName,
                    phone: phoneNumber,
                    document: String(charge.cpf || '').replace(/\D/g, ''),
                    email: charge.email || ''
                },
                metadata: {
                    firebaseId: charge.id,
                    type: charge.origem // 'assinatura' ou 'avulsa'
                },
                split_rules: [
                    { recipient_id: "re_cmm1zy49o2zhm0l9t0ispccsx", percentage: 96.2, liable: true, charge_processing_fee: false },
                    { recipient_id: "re_cmm204du72zq50l9t9owfdeni", percentage: 3.8, liable: false, charge_processing_fee: true }
                ]
            })
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Erro retornado pelo backend:", data);
            alert(`Erro ao gerar cobrança: ${data.error || response.statusText}`);
            throw new Error(data.error || `Erro no backend: ${response.statusText}`);
        }
        return data;

    } catch (error) {
        console.error("Erro ao chamar função backend (PIX):", error);
        throw error;
    };
  };

  const generatePix = async (trx) => {
      // Em um app real, o número de telefone do cliente seria buscado do banco de dados.
      let mockPhoneNumber = trx.telefone ? String(trx.telefone).replace(/\D/g, '') : ''; 
      
      // Garante o código do país (55) se o número tiver 10 ou 11 dígitos
      if (mockPhoneNumber && !mockPhoneNumber.startsWith('55') && (mockPhoneNumber.length === 10 || mockPhoneNumber.length === 11)) {
        mockPhoneNumber = '55' + mockPhoneNumber;
      }
      if (!mockPhoneNumber) mockPhoneNumber = '5511999999999';
      
      try {
          const pagarmeResponse = await createPagarmeOrder(trx, 'pix');
          
          // Salva o ID da transação no Firebase para conciliação futura
          const path = trx.origem === 'assinatura' ? `clientes/${trx.id}` : `cobrancas/${trx.id}`;
          await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/${path}.json`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId: pagarmeResponse.id })
          });
          
          const message = `Olá! Segue o código PIX para pagamento da seu plano "${trx.descricao}" no valor de ${trx.valorFormatado}:\n\n${pagarmeResponse.pixCopyPaste}\n\nBasta copiar o código e colar na área "PIX Copia e Cola" do seu aplicativo de banco.`;
          
          const whatsAppUrl = `https://wa.me/${mockPhoneNumber}?text=${encodeURIComponent(message)}`;

          setPixModalData({ 
              isOpen: true, 
              code: pagarmeResponse.pixCopyPaste, 
              whatsAppUrl: whatsAppUrl, 
              clientName: trx.descricao.split(' - ')[0],
              phone: mockPhoneNumber,
              message: message,
              type: 'pix'
          });
      } catch (error) {
          console.error("Erro ao gerar PIX:", error);
      }
  };

  const generateBoleto = async (trx) => {
      // Em um app real, o número de telefone do cliente seria buscado do banco de dados.
      let mockPhoneNumber = trx.telefone ? String(trx.telefone).replace(/\D/g, '') : ''; 
      
      // Garante o código do país (55) se o número tiver 10 ou 11 dígitos
      if (mockPhoneNumber && !mockPhoneNumber.startsWith('55') && (mockPhoneNumber.length === 10 || mockPhoneNumber.length === 11)) {
        mockPhoneNumber = '55' + mockPhoneNumber;
      }
      if (!mockPhoneNumber) mockPhoneNumber = '5511999999999';
      
      try {
          const pagarmeResponse = await createPagarmeOrder(trx, 'boleto');

          // Salva o ID da transação no Firebase para conciliação futura
          const path = trx.origem === 'assinatura' ? `clientes/${trx.id}` : `cobrancas/${trx.id}`;
          await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/${path}.json`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transactionId: pagarmeResponse.id })
          });
          
          const message = `Olá! Segue o boleto para pagamento da sua cobrança "${trx.descricao}" no valor de ${trx.valorFormatado}:\n\nLinha Digitável: ${pagarmeResponse.boletoLine}\nLink PDF: ${pagarmeResponse.boletoUrl}`;
          
          const whatsAppUrl = `https://wa.me/${mockPhoneNumber}?text=${encodeURIComponent(message)}`;

          setPixModalData({ 
              isOpen: true, 
              code: pagarmeResponse.boletoLine, 
              boletoUrl: pagarmeResponse.boletoUrl,
              whatsAppUrl: whatsAppUrl, 
              clientName: trx.descricao.split(' - ')[0],
              phone: mockPhoneNumber,
              message: message,
              type: 'boleto'
          });

      } catch (error) {
          console.error("Erro ao gerar Boleto:", error);
      }
  };

  const handleSaveCharge = async (e) => {
    e.preventDefault();
    const payload = {
      ...newCharge,
      valor: removeCurrencyMask(newCharge.valor),
      cpf: String(newCharge.cpf).replace(/\D/g, ''),
      dataCriacao: new Date().toISOString()
    };

    try {
      await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/cobrancas.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setModalOpen(false);
      setNewCharge({ cliente: '', descricao: '', valor: '', vencimento: '', status: 'Pendente', cpf: '', email: '' });
      await fetchTransacoes();
      alert('Cobrança avulsa criada com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar cobrança", error);
    }
  };

  const handleSaveAutomation = async (e) => {
    e.preventDefault();
    try {
        await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/automacoes_cobranca.json', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(automationConfig)
        });
        setAutomationModalOpen(false);
        alert('Configurações de automação salvas com sucesso!');
    } catch (error) {
        console.error("Erro ao salvar automação:", error);
        alert("Erro ao salvar configurações.");
    }
  };

  const handleEditPaymentClick = async (trx) => {
    if (trx.origem !== 'assinatura') {
      return;
    }
    setEditingTransaction(trx);
    try {
      const clientRes = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${trx.id}.json`);
      const clientData = await clientRes.json();
      let currentHistory = clientData.dataPagamento || [];
      if (!Array.isArray(currentHistory)) {
        currentHistory = typeof currentHistory === 'object' ? Object.values(currentHistory) : [];
      }
      setPaymentHistory(currentHistory);
      setEditMensalidade(maskCurrency(clientData.MENSALIDADE || '0'));
      setEditVencimento(clientData.VENCIMENTO || '');
      setEditPaymentModalOpen(true);
    } catch (error) {
      console.error("Erro ao buscar histórico de pagamento:", error);
    }
  };

  const handleSavePaymentHistory = async () => {
    if (!editingTransaction) return;
    try {
      await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${editingTransaction.id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dataPagamento: paymentHistory,
          MENSALIDADE: removeCurrencyMask(editMensalidade),
          VENCIMENTO: editVencimento
        })
      });
      setEditPaymentModalOpen(false);
      setEditingTransaction(null);
      await fetchTransacoes();
      alert('Alterações salvas com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar histórico de pagamento:", error);
    }
  };

  const handlePaymentHistoryChange = (index, value) => {
    const newHistory = [...paymentHistory];
    newHistory[index] = value;
    setPaymentHistory(newHistory);
  };

  const addPaymentHistoryEntry = () => {
    const monthName = editingTransaction.dataObj.toLocaleString('pt-BR', { month: 'long' });
    const today = new Date().toLocaleDateString('pt-BR');
    setPaymentHistory([...paymentHistory, `${monthName}: ${today}`]);
  };

  const removePaymentHistoryEntry = (index) => {
    setPaymentHistory(paymentHistory.filter((_, i) => i !== index));
  };

  const handleMarkAsPaid = async (trx) => {
    let isPaidOnline = false;
    let detectedMethod = null;

    // 1. Verifica na API da Pagar.me se houver ID de transação
    if (trx.transactionId) {
      try {
        const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/checkPagarmeOrderStatus`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: trx.transactionId })
        });
        const data = await response.json();
        if (data.status === 'paid') {
          isPaidOnline = true;
          detectedMethod = data.payment_method;
        }
      } catch (error) {
        console.error("Erro ao verificar Pagar.me", error);
      }
    }

    setConfirmPaymentModal({ isOpen: true, trx, isPaidOnline, detectedMethod });
  };

  const confirmPayment = async (method) => {
    const { trx } = confirmPaymentModal;
    if (!trx) return;

    const dataPagamento = new Date().toLocaleDateString('pt-BR');
    
    try {
        if (trx.origem === 'assinatura') {
          // Lógica para Assinatura: Adiciona ao array dataPagamento
          const monthName = trx.dataObj.toLocaleString('pt-BR', { month: 'long' });
          const paymentEntry = `${monthName}: ${dataPagamento} - ${method}`; // Ex: "janeiro: 10/01/2026 - Pix"

          // Busca histórico atual para não sobrescrever
          const clientRes = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${trx.id}.json`);
          const clientData = await clientRes.json();
          
          let currentHistory = clientData.dataPagamento || [];
          if (!Array.isArray(currentHistory)) {
             currentHistory = typeof currentHistory === 'object' ? Object.values(currentHistory) : [];
          }

          const newHistory = [...currentHistory, paymentEntry];

          await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${trx.id}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataPagamento: newHistory })
          });

        } else {
          // Lógica para Cobrança Avulsa
          await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/cobrancas/${trx.id}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Pago', dataPagamento, formaPagamento: method })
          });
        }

        // Atualiza estado local
        setTransacoes(prev => prev.map(t => {
            if (t.id !== trx.id) return t;
            return { 
                ...t, 
                status: 'Pago', 
                dataPagamento: trx.origem === 'assinatura' ? `${dataPagamento} - ${method}` : dataPagamento,
                formaPagamento: method
            };
        }));
        setMetrics(prev => ({ ...prev, pagosVal: prev.pagosVal + trx.valor, pagosCount: prev.pagosCount + 1 }));

    } catch (error) {
        console.error("Erro ao atualizar status", error);
    }
    setConfirmPaymentModal({ isOpen: false, trx: null, isPaidOnline: false, detectedMethod: null });
  };

  const syncPayments = async () => {
    const pendingTrx = transacoes.filter(t => t.status !== 'Pago' && t.transactionId);
    if (pendingTrx.length === 0) {
        alert("Nenhuma transação pendente com ID de pagamento para sincronizar.");
        return;
    }

    setIsSyncing(true);
    let updatedCount = 0;

    for (const trx of pendingTrx) {
        try {
            const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/checkPagarmeOrderStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: trx.transactionId })
            });
            const data = await response.json();
            
            if (data.status === 'paid') {
                const dataPagamento = new Date().toLocaleDateString('pt-BR');
                const method = data.payment_method === 'pix' ? 'Pix' : (data.payment_method === 'boleto' ? 'Boleto' : 'Cartão');

                // Atualiza Firebase
                if (trx.origem === 'assinatura') {
                    const monthName = trx.dataObj.toLocaleString('pt-BR', { month: 'long' });
                    const paymentEntry = `${monthName}: ${dataPagamento} - ${method}`;
                    
                    const clientRes = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${trx.id}.json`);
                    const clientData = await clientRes.json();
                    let currentHistory = clientData.dataPagamento || [];
                    if (!Array.isArray(currentHistory)) {
                        currentHistory = typeof currentHistory === 'object' ? Object.values(currentHistory) : [];
                    }
                    // Evita duplicidade
                    if (!currentHistory.some(h => h.includes(monthName) && h.includes(dataPagamento))) {
                         const newHistory = [...currentHistory, paymentEntry];
                         await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${trx.id}.json`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ dataPagamento: newHistory })
                         });
                         updatedCount++;
                    }
                } else {
                    await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/cobrancas/${trx.id}.json`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'Pago', dataPagamento, formaPagamento: method })
                    });
                    updatedCount++;
                }
            }
        } catch (error) {
            console.error(`Erro ao sincronizar trx ${trx.id}:`, error);
        }
    }
    
    setIsSyncing(false);
    if (updatedCount > 0) {
        alert(`${updatedCount} pagamentos foram identificados e atualizados!`);
        await fetchTransacoes();
    } else {
        alert("Sincronização concluída. Nenhum novo pagamento identificado.");
    }
  };

  const handleSendBulkEmails = async () => {
    if (!window.confirm("ATENÇÃO: Deseja enviar um e-mail de cobrança formal para TODOS os clientes ativos?")) return;
    
    setIsSendingEmails(true);
    try {
        const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/sendBulkBillingEmails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (response.ok) {
            alert(data.message);
        } else {
            alert(`Erro: ${data.error || 'Falha desconhecida'}`);
        }
    } catch (error) {
        console.error("Erro ao enviar e-mails:", error);
        alert("Erro de conexão ao enviar e-mails.");
    } finally {
        setIsSendingEmails(false);
    }
  };

  const handleNotify = async (trx) => {
    let phone = trx.telefone ? String(trx.telefone).replace(/\D/g, '') : '';
    
    // Garante o código do país (55) se o número tiver 10 ou 11 dígitos
    if (phone && !phone.startsWith('55') && (phone.length === 10 || phone.length === 11)) {
      phone = '55' + phone;
    }
    if (!phone) phone = '5511999999999';

    const vencimento = trx.dataObj ? trx.dataObj.toLocaleDateString('pt-BR') : trx.data;
    const message = `Olá! Lembrete de pagamento para: ${trx.descricao}. Valor: ${trx.valorFormatado}. Vencimento: ${vencimento}.`;
    
    const whatsAppUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsAppUrl, '_blank');
  };

  const handleSendEmail = async (trx) => {
    if (!trx.email) {
        alert("Cliente sem e-mail cadastrado.");
        return;
    }
    
    if (!window.confirm(`Deseja gerar PIX/Boleto e enviar por e-mail para ${trx.email}?`)) return;

    // Prepara dados para o backend
    const amount = Math.round(trx.valor * 100);
    const description = trx.descricao; // Para assinaturas é o nome, para avulsas é "Desc - Nome"
    
    let phone = trx.telefone ? String(trx.telefone).replace(/\D/g, '') : '';
    let areaCode = '11';
    let number = '999999999';
    if (phone.startsWith('55') && phone.length >= 12) {
        areaCode = phone.substring(2, 4);
        number = phone.substring(4);
    } else if (phone.length >= 10) {
        areaCode = phone.substring(0, 2);
        number = phone.substring(2);
    }

    // Tenta extrair o nome correto dependendo da origem
    let customerName = trx.descricao;
    if (trx.origem === 'avulsa' && trx.descricao.includes(' - ')) {
        customerName = trx.descricao.split(' - ')[1];
    }

    const customer = {
        name: customerName,
        email: trx.email,
        document: trx.cpf ? String(trx.cpf).replace(/\D/g, '') : '00000000000',
        phones: { mobile_phone: { country_code: "55", area_code: areaCode, number: number } },
        type: "individual"
    };

    try {
        alert("Gerando cobrança e enviando e-mail... Por favor, aguarde.");
        const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/sendBillingEmail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer, amount, description })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert("E-mail enviado com sucesso!");
        } else {
            alert(`Erro: ${data.error || 'Falha ao enviar'}`);
        }
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        alert("Erro de conexão ao enviar e-mail.");
    }
  };

  const pagamentosDoMesGrafico = useMemo(() => {
    const diasNoMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: diasNoMes }, (_, i) => String(i + 1));
    
    const dataPixCopiaCola = Array(diasNoMes).fill(0);
    const dataChavePix = Array(diasNoMes).fill(0);
    const dataBoleto = Array(diasNoMes).fill(0);
    const dataOutros = Array(diasNoMes).fill(0);

    transacoes.forEach(trx => {
        if (trx.status === 'Pago' && trx.dataPagamento && trx.dataPagamento !== '-') {
            const parts = trx.dataPagamento.split('/');
            if (parts.length === 3) {
                const dia = parseInt(parts[0], 10);
                const mes = parseInt(parts[1], 10) - 1;
                const ano = parseInt(parts[2], 10);

                if (mes === currentDate.getMonth() && ano === currentDate.getFullYear()) {
                    const metodo = trx.formaPagamento ? trx.formaPagamento.toLowerCase() : '';
                    
                    if (metodo.includes('copia e cola')) {
                        dataPixCopiaCola[dia - 1] += trx.valor;
                    } else if (metodo.includes('chave pix')) {
                        dataChavePix[dia - 1] += trx.valor;
                    } else if (metodo.includes('boleto')) {
                        dataBoleto[dia - 1] += trx.valor;
                    } else {
                        dataOutros[dia - 1] += trx.valor;
                    }
                }
            }
        }
    });

    return {
        labels,
        datasets: [
            {
                label: 'Pix Copia e Cola',
                data: dataPixCopiaCola,
                backgroundColor: '#28a745',
                stack: 'Stack 0',
            },
            {
                label: 'Chave Pix',
                data: dataChavePix,
                backgroundColor: '#17a2b8',
                stack: 'Stack 0',
            },
            {
                label: 'Boleto',
                data: dataBoleto,
                backgroundColor: '#6c757d',
                stack: 'Stack 0',
            },
            {
                label: 'Dinheiro/Outros',
                data: dataOutros,
                backgroundColor: '#ffc107',
                stack: 'Stack 0',
            },
        ],
    };
  }, [transacoes, currentDate]);

  const optionsGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) { label += ': '; }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
        x: { 
            title: { display: true, text: 'Dia do Mês' },
            stacked: true
        },
        y: { 
            ticks: { callback: (value) => 'R$ ' + value.toLocaleString('pt-BR') },
            stacked: true
        }
    }
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Sistema de Cobranças</h2>
      
      <div className="financeiro-header">
        <p className="cotacao-subtitle" style={{ marginBottom: 0 }}>Gerencie faturas, recebimentos e inadimplência.</p>
        
        <div className="month-selector">
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><FaChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1.1rem', color: '#333', minWidth: '180px', justifyContent: 'center' }}>
                <FaCalendarAlt style={{ color: '#007bff' }} />
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
            </div>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><FaChevronRight /></button>
        </div>
      </div>

      <div className="tabs-container financeiro-tabs">
        {userRole !== 'Financeiro' && (
          <button className={`btn-tab ${mainTab === 'dashboard' ? 'active' : ''}`} onClick={() => setMainTab('dashboard')}>
            <FaChartPie style={{ marginRight: '5px' }} /> Painel Dashboard
          </button>
        )}
        <button className={`btn-tab ${mainTab === 'cobrancas' ? 'active' : ''}`} onClick={() => setMainTab('cobrancas')}>
          <FaFileInvoiceDollar style={{ marginRight: '5px' }} /> Cobranças e Faturas
        </button>
        {userRole === 'Admin' && (
             <button className={`btn-tab ${mainTab === 'comissoes' ? 'active' : ''}`} onClick={() => setMainTab('comissoes')}>
                <FaHandHoldingUsd style={{ marginRight: '5px' }} /> Comissões
             </button>
        )}
      </div>

      {mainTab === 'dashboard' && userRole !== 'Financeiro' && (
        <>
          <div className="dashboard-widgets">
            <div className="widget">
              <h3>Receita Prevista</h3>
              <p className="widget-value" style={{ color: '#28a745' }}>R$ {metrics.receitaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <span className="widget-trend"><FaWallet /> Previsão Mensal</span>
            </div>
            <div className="widget">
              <h3>Clientes em Atraso</h3>
              <p className="widget-value" style={{ color: '#dc3545' }}>{metrics.atrasoCount}</p>
              <span className="widget-trend" style={{ color: '#dc3545' }}><FaArrowDown /> R$ {metrics.atrasoVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="widget">
              <h3>Clientes Pagos</h3>
              <p className="widget-value" style={{ color: '#1e90ff' }}>{metrics.pagosCount}</p>
              <span className="widget-trend widget-trend-lucro lucro-widget"><FaCheckCircle /> R$ {metrics.pagosVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
          
          <div className="faturas-section" style={{ marginTop: '30px' }}>
              <h3 className="faturas-section-title">Evolução de Pagamentos no Mês</h3>
              <div className="chart-wrapper" style={{ height: '300px', width: '100%' }}>
                <Bar data={pagamentosDoMesGrafico} options={optionsGrafico} />
              </div>
          </div>
        </>
      )}

      {mainTab === 'cobrancas' && (
        <div className="faturas-section" style={{ marginTop: '30px' }}>
          <div className="financeiro-section-header">
              <h3 className="faturas-section-title" style={{ marginBottom: 0 }}>Cobranças e Faturas</h3>
              <div className="financeiro-actions">
                  <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaPlus /> Nova Cobrança
                  </button>
                  <button onClick={() => setAutomationModalOpen(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#6f42c1', borderColor: '#6f42c1', color: '#fff' }}>
                      <FaRobot /> Automação
                  </button>
                  <button onClick={handleSendBulkEmails} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} disabled={isSyncing || isSendingEmails}>
                      {isSendingEmails ? <FaSpinner className="icon-spin" /> : <FaEnvelope />}
                      {isSendingEmails ? 'Enviando...' : 'Enviar Cobrança Geral'}
                  </button>
                  <button onClick={syncPayments} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }} disabled={isSyncing}>
                      <FaSync className={isSyncing ? "icon-spin" : ""} /> {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                  </button>
                  <button onClick={() => setShowFilters(!showFilters)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaFilter /> {showFilters ? 'Ocultar Filtros' : 'Filtrar'}
                  </button>
              </div>
          </div>
          
          {showFilters && (
          <div className="tabs-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className={`btn-tab ${filterTab === 'todos' ? 'active' : ''}`} onClick={() => setFilterTab('todos')}><FaList /> Todos</button>
            <button className={`btn-tab ${filterTab === 'atraso' ? 'active' : ''}`} onClick={() => setFilterTab('atraso')}><FaExclamationCircle /> Em Atraso</button>
            <button className={`btn-tab ${filterTab === 'pagos' ? 'active' : ''}`} onClick={() => setFilterTab('pagos')}><FaCheckCircle /> Pagos</button>
            <button className={`btn-tab ${filterTab === 'a_vencer' ? 'active' : ''}`} onClick={() => setFilterTab('a_vencer')}><FaClock /> A Vencer</button>
            
            <select 
              className="filtro-input"
              style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              <option value="">Todos os Tipos</option>
              {[...new Set(transacoes.map(t => t.tipo).filter(Boolean))].map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>

            <input 
              type="date" 
              className="filtro-input"
              style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd' }}
              value={filterVencimento}
              onChange={(e) => setFilterVencimento(e.target.value)}
            />

            <input 
              type="text" 
              placeholder="Buscar por nome ou CPF..." 
              className="filtro-input"
              style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '250px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          )}

          <div className="table-container">
            <table className="historico-tabela">
              <thead>
                <tr>
                  <th>Descrição</th><th>Tipo</th><th>Vencimento</th><th>Valor</th><th>Pagamento</th><th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transacoesFiltradas.map((trx) => (
                  <tr key={trx.id}>
                    <td>{trx.descricao}</td>
                    <td>
                      <span style={{ color: trx.tipo === 'TITULAR' ? '#28a745' : '#282aa7ff', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {trx.tipo}
                      </span>
                    </td>
                    <td>{trx.data}</td>
                    <td>{trx.valorFormatado}</td>
                    <td>
                      {trx.dataPagamento}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                          {trx.status !== 'Pago' && (
                              <>
                                <button onClick={() => handleMarkAsPaid(trx)} title="Baixar (Marcar como Pago)" style={{ background: 'none', border: 'none', color: '#28a745', cursor: 'pointer', fontSize: '1.1rem' }}>
                                    <FaCheck />
                                </button>
                                <button onClick={() => handleNotify(trx)} title="Enviar Lembrete WhatsApp" style={{ background: 'none', border: 'none', color: '#ffc107', cursor: 'pointer', fontSize: '1.1rem' }}>
                                    <FaBell />
                                </button>
                                <button onClick={() => handleSendEmail(trx)} title="Enviar Fatura por E-mail" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.1rem' }}>
                                    <FaEnvelope />
                                </button>
                                <button onClick={() => setPaymentSelectionModal({ isOpen: true, trx: trx })} title="Gerar Cobrança (PIX/Boleto)" style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', fontSize: '1.1rem' }}>
                                    <FaWhatsapp />
                                </button>
                              </>
                          )}
                          {trx.origem === 'assinatura' && (
                              <button onClick={() => handleEditPaymentClick(trx)} title="Editar Pagamentos" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.1rem' }}>
                                  <FaEdit />
                              </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mainTab === 'comissoes' && userRole === 'Admin' && (
          <div className="faturas-section" style={{ marginTop: '30px' }}>
              <h3 className="faturas-section-title">Comissões de Vendas ({currentDate.toLocaleString('pt-BR', { month: 'long' })})</h3>
              <div className="table-container">
                  <table className="historico-tabela">
                      <thead>
                          <tr>
                              <th>Vendedor</th>
                              <th>Vendas (Pagos)</th>
                              <th>Total Comissão</th>
                              <th>Detalhes</th>
                          </tr>
                      </thead>
                      <tbody>
                          {comissoes.map((c, idx) => (
                              <tr key={idx}>
                                  <td>{c.nome}</td>
                                  <td>{c.vendas}</td>
                                  <td style={{ color: '#28a745', fontWeight: 'bold' }}>{c.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                  <td>
                                      <details>
                                          <summary style={{cursor: 'pointer', color: '#007bff'}}>Ver Clientes</summary>
                                          <ul style={{listStyle: 'none', padding: '10px', fontSize: '0.9rem', background: '#f8f9fa', borderRadius: '5px', marginTop: '5px'}}>
                                              {c.detalhes.map((d, i) => (
                                                  <li key={i} style={{marginBottom: '5px', borderBottom: '1px solid #eee', paddingBottom: '5px'}}>
                                                      <strong>{d.cliente}</strong> - {d.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} <br/>
                                                      <small>Pagamento em: {d.data}</small>
                                                  </li>
                                              ))}
                                              {c.detalhes.length === 0 && <li>Nenhuma venda confirmada neste mês.</li>}
                                          </ul>
                                      </details>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {isModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setModalOpen(false)} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Financeiro</h3>
              <h2>Nova Cobrança Avulsa</h2>
            </div>
            <form onSubmit={handleSaveCharge} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <div className="form-group"><label>Cliente</label><input required value={newCharge.cliente} onChange={(e) => setNewCharge({...newCharge, cliente: e.target.value})} placeholder="Nome do Cliente" /></div>
                <div className="form-group"><label>CPF do Cliente</label><input required value={newCharge.cpf} onChange={(e) => setNewCharge({...newCharge, cpf: maskCPF(e.target.value)})} placeholder="000.000.000-00" /></div>
                <div className="form-group"><label>Email do Cliente (Opcional)</label><input type="email" value={newCharge.email} onChange={(e) => setNewCharge({...newCharge, email: e.target.value})} placeholder="email@exemplo.com" /></div>
                <div className="form-group"><label>Descrição</label><input required value={newCharge.descricao} onChange={(e) => setNewCharge({...newCharge, descricao: e.target.value})} placeholder="Ex: Taxa de Adesão" /></div>
                <div className="form-group"><label>Valor</label><input required value={newCharge.valor} onChange={(e) => setNewCharge({...newCharge, valor: maskCurrency(e.target.value)})} placeholder="R$ 0,00" /></div>                
                <div className="form-group"><label>Vencimento</label><input required type="date" value={newCharge.vencimento} onChange={(e) => setNewCharge({...newCharge, vencimento: e.target.value})} /></div>
                
                <div className="popup-actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary"><FaFileInvoiceDollar /> Gerar Cobrança</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {pixModalData.isOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setPixModalData({ ...pixModalData, isOpen: false })} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Enviar Cobrança {pixModalData.type === 'pix' ? 'PIX' : 'Boleto'} via WhatsApp</h3>
              <h2>Cliente: {pixModalData.clientName}</h2>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <p>O {pixModalData.type === 'pix' ? 'código PIX (Copia e Cola)' : 'código de barras do Boleto'} foi gerado. Você pode copiá-lo ou abrir o WhatsApp para enviar manualmente.</p>
                <div className="form-group">
                    <label>{pixModalData.type === 'pix' ? 'Código PIX' : 'Linha Digitável'}</label>
                    <textarea 
                        readOnly 
                        value={pixModalData.code} 
                        style={{ width: '100%', minHeight: '100px', fontFamily: 'monospace', resize: 'none', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }} 
                    />
                </div>
                <div className="popup-actions" style={{ justifyContent: 'space-between', display: 'flex' }}>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => { navigator.clipboard.writeText(pixModalData.code); }}
                    >
                        Copiar {pixModalData.type === 'pix' ? 'Código' : 'Linha Digitável'}
                    </button>
                    {pixModalData.type === 'boleto' && pixModalData.boletoUrl && (
                        <a href={pixModalData.boletoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Ver Boleto (PDF)</a>
                    )}
                    <a href={pixModalData.whatsAppUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaWhatsapp /> Enviar no WhatsApp
                    </a>
                </div>
            </div>
          </div>
        </div>
      )}

      {paymentSelectionModal.isOpen && (
        <div className="popup-overlay">
            <div className="popup-content cliente-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
                <button onClick={() => setPaymentSelectionModal({ isOpen: false, trx: null })} className="popup-close">&times;</button>
                <div className="cliente-modal-header" style={{ justifyContent: 'center' }}>
                    <h3>Selecione o Método</h3>
                </div>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px', marginBottom: '20px' }}>
                    <button onClick={() => {
                        setPaymentSelectionModal({ isOpen: false, trx: null });
                        generatePix(paymentSelectionModal.trx);
                    }} className="btn btn-primary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', minWidth: '120px' }}>
                        <FaQrcode size={24} /> PIX
                    </button>
                    <button onClick={() => {
                        setPaymentSelectionModal({ isOpen: false, trx: null });
                        generateBoleto(paymentSelectionModal.trx);
                    }} className="btn btn-secondary" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '20px', minWidth: '120px' }}>
                        <FaBarcode size={24} /> Boleto
                    </button>
                </div>
            </div>
        </div>
      )}

      {confirmPaymentModal.isOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '450px', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setConfirmPaymentModal({ isOpen: false, trx: null, isPaidOnline: false, detectedMethod: null })} className="popup-close">&times;</button>
            <div className="cliente-modal-header" style={{ justifyContent: 'center' }}>
              <h3>Confirmar Pagamento</h3>
            </div>
            <div style={{ marginTop: '20px' }}>
                <p><strong>{confirmPaymentModal.trx?.descricao}</strong></p>
                <p>Valor: {confirmPaymentModal.trx?.valorFormatado}</p>
                
                {confirmPaymentModal.isPaidOnline && (
                    <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '15px', borderRadius: '8px', marginBottom: '20px', marginTop: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem' }}>Pagamento identificado na Pagar.me!</p>
                        <p style={{ margin: '5px 0 10px 0', fontSize: '0.9rem' }}>Método detectado: <strong>{confirmPaymentModal.detectedMethod === 'pix' ? 'PIX' : (confirmPaymentModal.detectedMethod === 'boleto' ? 'Boleto' : 'Cartão')}</strong></p>
                        <button 
                            onClick={() => confirmPayment(confirmPaymentModal.detectedMethod === 'pix' ? 'Pix Copia e Cola' : (confirmPaymentModal.detectedMethod === 'boleto' ? 'Boleto' : 'Cartão'))}
                            className="btn btn-primary"
                            style={{ width: '100%', backgroundColor: '#28a745', border: 'none', fontWeight: 'bold' }}
                        >
                            <FaCheckCircle style={{ marginRight: '5px' }} /> Confirmar Automaticamente
                        </button>
                    </div>
                )}
                
                <p style={{ marginTop: '15px', marginBottom: '10px' }}>{confirmPaymentModal.isPaidOnline ? 'Ou selecione manualmente:' : 'Selecione o método de pagamento:'}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => confirmPayment('Pix Copia e Cola')} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                        <FaQrcode /> Pix Copia e Cola
                    </button>
                    <button onClick={() => confirmPayment('Chave Pix')} className="btn btn-primary" style={{ justifyContent: 'center', backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}>
                        <FaWallet /> Chave Pix
                    </button>
                    <button onClick={() => confirmPayment('Boleto')} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                        <FaBarcode /> Boleto
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {isAutomationModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '500px' }}>
            <button onClick={() => setAutomationModalOpen(false)} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Configurar</h3>
              <h2>Automação de Cobrança</h2>
            </div>
            <form onSubmit={handleSaveAutomation} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="checkbox" 
                        id="activeAuto" 
                        checked={automationConfig.active} 
                        onChange={(e) => setAutomationConfig({...automationConfig, active: e.target.checked})} 
                        style={{ width: '20px', height: '20px' }}
                    />
                    <label htmlFor="activeAuto" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>Ativar Disparos Automáticos</label>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid #eee', width: '100%' }} />

                <div className="form-group">
                    <label>Lembrete Pré-Vencimento (Dias antes)</label>
                    <input type="number" min="1" max="10" value={automationConfig.daysBefore} onChange={(e) => setAutomationConfig({...automationConfig, daysBefore: parseInt(e.target.value)})} />
                    <small>Envia um lembrete X dias antes do vencimento.</small>
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="sendOnDueDate" checked={automationConfig.sendOnDueDate} onChange={(e) => setAutomationConfig({...automationConfig, sendOnDueDate: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <label htmlFor="sendOnDueDate" style={{ margin: 0 }}>Enviar no Dia do Vencimento</label>
                </div>

                <div className="form-group">
                    <label>Cobrança de Atraso (Frequência em dias)</label>
                    <input type="number" min="1" max="30" value={automationConfig.frequencyAfter} onChange={(e) => setAutomationConfig({...automationConfig, frequencyAfter: parseInt(e.target.value)})} />
                    <small>Envia e-mail de cobrança a cada X dias após o vencimento.</small>
                </div>

                <div className="popup-actions" style={{ marginTop: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setAutomationModalOpen(false)} className="btn btn-secondary">Cancelar</button>
                    <button type="submit" className="btn btn-primary">Salvar Configurações</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {isEditPaymentModalOpen && editingTransaction && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setEditPaymentModalOpen(false)} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Editar Detalhes e Histórico</h3>
              <h2>{editingTransaction.descricao}</h2>
            </div>

            <div className="form-grid edit-payment-grid">
                <div className="form-group">
                    <label>Valor da Mensalidade</label>
                    <input 
                        type="text" 
                        value={editMensalidade} 
                        onChange={(e) => setEditMensalidade(maskCurrency(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label>Data de Vencimento</label>
                    <input 
                        type="text" 
                        value={editVencimento} 
                        onChange={(e) => setEditVencimento(maskDate(e.target.value))}
                        maxLength="10"
                        placeholder="DD/MM/AAAA"
                    />
                </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p><strong>Histórico de Pagamentos:</strong> (Formato: "Mês: DD/MM/AAAA")</p>
              {paymentHistory.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={entry}
                    onChange={(e) => handlePaymentHistoryChange(index, e.target.value)}
                    style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <button onClick={() => removePaymentHistoryEntry(index)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1.2rem' }}>
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button onClick={addPaymentHistoryEntry} className="btn btn-secondary" style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                <FaPlus /> Adicionar Pagamento (Mês Atual)
              </button>
            </div>
            <div className="popup-actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditPaymentModalOpen(false)} className="btn btn-secondary">Cancelar</button>
              <button type="button" onClick={handleSavePaymentHistory} className="btn btn-primary">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financeiro;