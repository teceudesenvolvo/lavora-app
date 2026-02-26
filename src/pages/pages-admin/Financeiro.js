import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowDown, FaWallet, FaExclamationCircle, FaCheckCircle, FaClock, FaList, FaFileInvoiceDollar, FaBell, FaCheck, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaWhatsapp, FaEdit, FaTrash, FaPlus, FaEnvelope, FaBarcode, FaQrcode, FaFilter, FaSync, FaChartPie } from 'react-icons/fa';
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
  const [rawData, setRawData] = useState({ clientes: {}, cobrancas: {} });
  const [transacoes, setTransacoes] = useState([]);
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

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        // Busca Clientes (Assinaturas) e Cobranças Avulsas em paralelo
        const [resClientes, resCobrancas] = await Promise.all([
          fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json'),
          fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/cobrancas.json')
        ]);

        if (!resClientes.ok || !resCobrancas.ok) {
            throw new Error('Falha ao buscar dados: Acesso negado (401). Verifique as regras do Database.');
        }

        const dataClientes = await resClientes.json();
        const dataCobrancas = await resCobrancas.json();

        setRawData({
            clientes: dataClientes?.Clientes || dataClientes || {},
            cobrancas: dataCobrancas || {}
        });
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
      }
    };

    fetchTransacoes();
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
          const { clientes: clientesData, cobrancas: cobrancasData } = rawData;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const selectedMonth = currentDate.getMonth();
          const selectedYear = currentDate.getFullYear();

          let receitaMensal = 0;
          let atrasoVal = 0;
          let atrasoCount = 0;
          let pagosVal = 0;
          let pagosCount = 0;

          // Processa Assinaturas (Clientes)
          const loadedTransacoes = Object.keys(clientesData).map(key => {
            const item = clientesData[key];
            if (!item) return null;

            const valor = parseFloat(item.MENSALIDADE) || 0;
            
            // Normalização de Data (Trata M/D/Y e D/M/Y)
            // Para assinaturas, projetamos a data de vencimento para o mês selecionado
            let day = 1;

            if (item.VENCIMENTO) {
                const parts = item.VENCIMENTO.split('/');
                if (parts.length === 3) {
                    day = parseInt(parts[0], 10);
                    // Se o "mês" for maior que 12, assume-se que é o dia (formato M/D/Y vindo do banco)
                    const monthPart = parseInt(parts[1], 10);
                    if (monthPart > 12) { day = monthPart; }
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

            return {
              id: key,
              descricao: `${item.USUARIO}`,
              cpf: item.CPF ? String(item.CPF) : '',
              valor: valor,
              valorFormatado: `R$ ${item.MENSALIDADE}`,
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
            const valor = parseFloat(item.valor) || 0;
            
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
                amount: Math.round(charge.valor * 100), // Valor em centavos
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
      window.location.reload(); // Recarrega para atualizar a lista (simplificação)
    } catch (error) {
      console.error("Erro ao salvar cobrança", error);
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
      window.location.reload(); // Recarrega para atualizar a lista
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
        alert(`${updatedCount} pagamentos foram identificados e atualizados! A página será recarregada.`);
        window.location.reload();
    } else {
        alert("Sincronização concluída. Nenhum novo pagamento identificado.");
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

  const handleSendEmail = (trx) => {
    if (!trx.email) {
        return;
    }
    const vencimento = trx.dataObj ? trx.dataObj.toLocaleDateString('pt-BR') : trx.data;
    const subject = `Lembrete de Pagamento: ${trx.descricao}`;
    const body = `Olá! \n\nLembrete de pagamento para: ${trx.descricao}.\nValor: ${trx.valorFormatado}.\nVencimento: ${vencimento}.\n\nAtenciosamente,\nEquipe Lavoro`;
    
    window.open(`mailto:${trx.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
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
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p className="cotacao-subtitle" style={{ marginBottom: 0 }}>Gerencie faturas, recebimentos e inadimplência.</p>
        
        <div className="month-selector" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><FaChevronLeft /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '1.1rem', color: '#333', minWidth: '180px', justifyContent: 'center' }}>
                <FaCalendarAlt style={{ color: '#007bff' }} />
                {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase())}
            </div>
            <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><FaChevronRight /></button>
        </div>
      </div>

      <div className="tabs-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        {userRole !== 'Financeiro' && (
          <button className={`btn-tab ${mainTab === 'dashboard' ? 'active' : ''}`} onClick={() => setMainTab('dashboard')}>
            <FaChartPie style={{ marginRight: '5px' }} /> Painel Dashboard
          </button>
        )}
        <button className={`btn-tab ${mainTab === 'cobrancas' ? 'active' : ''}`} onClick={() => setMainTab('cobrancas')}>
          <FaFileInvoiceDollar style={{ marginRight: '5px' }} /> Cobranças e Faturas
        </button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="faturas-section-title" style={{ marginBottom: 0 }}>Cobranças e Faturas</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaPlus /> Nova Cobrança
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
                              <button onClick={() => handleMarkAsPaid(trx)} title="Baixar (Marcar como Pago)" style={{ background: 'none', border: 'none', color: '#28a745', cursor: 'pointer', fontSize: '1.1rem' }}>
                                  <FaCheck />
                              </button>
                          )}
                          <button onClick={() => handleNotify(trx)} title="Enviar Lembrete" style={{ background: 'none', border: 'none', color: '#ffc107', cursor: 'pointer', fontSize: '1.1rem' }}>
                              <FaBell />
                          </button>
                          <button onClick={() => handleSendEmail(trx)} title="Enviar por E-mail" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.1rem' }}>
                              <FaEnvelope />
                          </button>
                          <button onClick={() => setPaymentSelectionModal({ isOpen: true, trx: trx })} title="Gerar Cobrança (PIX/Boleto)" style={{ background: 'none', border: 'none', color: '#25D366', cursor: 'pointer', fontSize: '1.1rem' }}>
                              <FaWhatsapp />
                          </button>
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

      {isModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '500px' }}>
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
          <div className="popup-content cliente-modal" style={{ maxWidth: '650px' }}>
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
          <div className="popup-content cliente-modal" style={{ maxWidth: '450px', textAlign: 'center' }}>
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

      {isEditPaymentModalOpen && editingTransaction && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '600px' }}>
            <button onClick={() => setEditPaymentModalOpen(false)} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Editar Detalhes e Histórico</h3>
              <h2>{editingTransaction.descricao}</h2>
            </div>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
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