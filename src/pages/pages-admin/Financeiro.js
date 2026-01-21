import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowDown, FaWallet, FaExclamationCircle, FaCheckCircle, FaClock, FaList, FaFileInvoiceDollar, FaBell, FaCheck, FaEnvelope, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
  const [filterTab, setFilterTab] = useState('todos');
  const [metrics, setMetrics] = useState({
    custoTotal: 5000, // Custo total fixo como exemplo
    receitaMensal: 0,
    atrasoVal: 0,
    atrasoCount: 0,
    pagosVal: 0,
    pagosCount: 0
  });

  // Estados para Nova Cobrança
  const [isModalOpen, setModalOpen] = useState(false);
  const [newCharge, setNewCharge] = useState({ cliente: '', descricao: '', valor: '', vencimento: '', status: 'Pendente' });

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

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        // Busca Clientes (Assinaturas) e Cobranças Avulsas em paralelo
        const [resClientes, resCobrancas] = await Promise.all([
          fetch('https://lavoro-servicos-default-rtdb.firebaseio.com/clientes.json'),
          fetch('https://lavoro-servicos-default-rtdb.firebaseio.com/cobrancas.json')
        ]);

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

            // Determine status based on date (mock logic since we don't have real status)
            let status = 'Pendente';
            if (vencimentoDate) {
                if (vencimentoDate < today) status = 'Atrasado';
                else status = 'A Vencer';
            }
            // Note: 'Pago' status would come from DB in real app.

            // Metrics Calculation
            if (vencimentoDate) {
                receitaMensal += valor;
            }
            if (status === 'Atrasado') {
                atrasoVal += valor;
                atrasoCount++;
            }
            // Assinaturas geralmente não têm status 'Pago' explícito no JSON de clientes simples, assumimos pendente/atrasado

            const diaVencimento = vencimentoDate ? String(vencimentoDate.getDate()).padStart(2, '0') : '-';

            return {
              id: key,
              descricao: `${item.USUARIO}`,
              valor: valor,
              valorFormatado: `R$ ${item.MENSALIDADE}`,
              tipo: item.CONTRATO,
              data: diaVencimento,
              dataObj: vencimentoDate,
              dataPagamento: '-',
              status: status,
              origem: 'assinatura'
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

            return {
              id: key,
              descricao: `${item.descricao} - ${item.cliente}`,
              valor: valor,
              valorFormatado: `R$ ${valor.toFixed(2).replace('.', ',')}`,
              tipo: 'Cobrança Avulsa',
              data: diaVencimento,
              dataObj: vencimentoDate,
              dataPagamento: item.dataPagamento || '-',
              status: status,
              origem: 'avulsa'
            };
          }).filter(item => item !== null);

          // Combina e ordena por data
          const todasTransacoes = [...loadedTransacoes, ...loadedCobrancas].sort((a, b) => {
             const diaA = a.dataObj ? a.dataObj.getDate() : 32;
             const diaB = b.dataObj ? b.dataObj.getDate() : 32;
             return diaA - diaB; // Ordena pelo dia do mês (crescente)
          });

          setTransacoes(todasTransacoes);
          setMetrics({ receitaMensal, atrasoVal, atrasoCount, pagosVal, pagosCount });
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
        if (filterTab === 'todos') return true;
        if (filterTab === 'atraso') return t.status === 'Atrasado';
        if (filterTab === 'pagos') return t.status === 'Pago';
        if (filterTab === 'a_vencer') return t.status === 'A Vencer' || t.status === 'Pendente';
        return true;
    });
  }, [transacoes, filterTab]);

  const previsaoLucro = useMemo(() => {
    return metrics.receitaMensal - metrics.custoTotal;
  }, [metrics.receitaMensal, metrics.custoTotal]);

  // --- Funções de Ação ---

  const handleSaveCharge = async (e) => {
    e.preventDefault();
    const payload = {
      ...newCharge,
      valor: removeCurrencyMask(newCharge.valor)
    };

    try {
      await fetch('https://lavoro-servicos-default-rtdb.firebaseio.com/cobrancas.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Cobrança gerada com sucesso!');
      setModalOpen(false);
      setNewCharge({ cliente: '', descricao: '', valor: '', vencimento: '', status: 'Pendente' });
      window.location.reload(); // Recarrega para atualizar a lista (simplificação)
    } catch (error) {
      console.error("Erro ao salvar cobrança", error);
    }
  };

  const handleMarkAsPaid = async (trx) => {
    if (trx.origem === 'assinatura') {
      alert('Para assinaturas, gerencie o status no cadastro do cliente.');
      return;
    }
    if (window.confirm(`Confirmar pagamento de ${trx.descricao}?`)) {
      const dataPagamento = new Date().toLocaleDateString('pt-BR');
      try {
        await fetch(`https://lavoro-servicos-default-rtdb.firebaseio.com/cobrancas/${trx.id}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Pago', dataPagamento })
        });
        // Atualiza localmente
        setTransacoes(prev => prev.map(t => t.id === trx.id ? { ...t, status: 'Pago', dataPagamento } : t));
        setMetrics(prev => ({ ...prev, pagosVal: prev.pagosVal + trx.valor, pagosCount: prev.pagosCount + 1 }));
      } catch (error) {
        console.error("Erro ao atualizar status", error);
      }
    }
  };

  const handleSendAll = () => {
    const cobrancasPendentes = transacoesFiltradas.filter(t => t.status !== 'Pago');
    
    if (cobrancasPendentes.length === 0) {
      alert("Nenhuma cobrança pendente ou atrasada listada para envio.");
      return;
    }

    if (window.confirm(`Confirma o envio de cobrança via e-mail para ${cobrancasPendentes.length} clientes listados?`)) {
       alert(`Iniciando envio para ${cobrancasPendentes.length} destinatários... (Simulação)`);
    }
  };

  const handleNotify = (trx) => {
    alert(`Lembrete de cobrança enviado para ${trx.descricao} via WhatsApp/Email!`);
  };

  const pagamentosDoMesGrafico = useMemo(() => {
    const diasNoMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: diasNoMes }, (_, i) => String(i + 1));
    const data = Array(diasNoMes).fill(0);

    transacoes.forEach(trx => {
        if (trx.dataPagamento && trx.dataPagamento !== '-') {
            const parts = trx.dataPagamento.split('/');
            if (parts.length === 3) {
                const dia = parseInt(parts[0], 10);
                const mes = parseInt(parts[1], 10) - 1;
                const ano = parseInt(parts[2], 10);

                if (mes === currentDate.getMonth() && ano === currentDate.getFullYear()) {
                    data[dia - 1] += trx.valor;
                }
            }
        }
    });

    return {
        labels,
        datasets: [
            {
                label: 'Pagamentos Realizados',
                data: data,
                backgroundColor: 'rgba(40, 167, 69, 0.7)', // Verde para pagamentos
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
        x: { title: { display: true, text: 'Dia do Mês' } },
        y: { ticks: { callback: (value) => 'R$ ' + value.toLocaleString('pt-BR') } }
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
          <span className="widget-trend"><FaCheckCircle /> R$ {metrics.pagosVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
        <div className="dashboard-widgets" style={{ marginTop: '20px' }}>
        <div className="widget">
          <h3>Previsão de Lucro (Mês)</h3>
          <p className="widget-value" style={{ color: previsaoLucro >= 0 ? '#28a745' : '#dc3545' }}>R$ {previsaoLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="faturas-section" style={{ marginTop: '30px' }}>
          <h3 className="faturas-section-title">Evolução de Pagamentos no Mês</h3>
          <div className="chart-wrapper" style={{ height: '300px', width: '100%' }}>
            <Bar data={pagamentosDoMesGrafico} options={optionsGrafico} />
          </div>
      </div>

      <div className="faturas-section" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="faturas-section-title" style={{ marginBottom: 0 }}>Cobranças e Faturas</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={handleSendAll} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaEnvelope /> Disparar Emails
                </button>
                
            </div>
        </div>
        
        <div className="tabs-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button className={`btn-tab ${filterTab === 'todos' ? 'active' : ''}`} onClick={() => setFilterTab('todos')}><FaList /> Todos</button>
          <button className={`btn-tab ${filterTab === 'atraso' ? 'active' : ''}`} onClick={() => setFilterTab('atraso')}><FaExclamationCircle /> Em Atraso</button>
          <button className={`btn-tab ${filterTab === 'pagos' ? 'active' : ''}`} onClick={() => setFilterTab('pagos')}><FaCheckCircle /> Pagos</button>
          <button className={`btn-tab ${filterTab === 'a_vencer' ? 'active' : ''}`} onClick={() => setFilterTab('a_vencer')}><FaClock /> A Vencer</button>
        </div>

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
                    <span style={{ color: trx.tipo === 'receita' ? '#28a745' : '#dc3545', fontWeight: 'bold', textTransform: 'capitalize' }}>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};

export default Financeiro;