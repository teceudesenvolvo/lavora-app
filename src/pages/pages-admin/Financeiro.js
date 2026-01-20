import React, { useState, useEffect, useMemo } from 'react';
import { FaArrowDown, FaWallet, FaExclamationCircle, FaCheckCircle, FaClock, FaList } from 'react-icons/fa';
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
  const [transacoes, setTransacoes] = useState([]);
  const [filterTab, setFilterTab] = useState('todos');
  const [metrics, setMetrics] = useState({
    receitaMensal: 0,
    atrasoVal: 0,
    atrasoCount: 0,
    pagosVal: 0,
    pagosCount: 0
  });

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-default-rtdb.firebaseio.com/clientes.json');
        const data = await response.json();
        
        if (data) {
          const clientesData = data.Clientes || data;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const currentMonth = today.getMonth();
          const currentYear = today.getFullYear();

          let receitaMensal = 0;
          let atrasoVal = 0;
          let atrasoCount = 0;
          let pagosVal = 0;
          let pagosCount = 0;

          const loadedTransacoes = Object.keys(clientesData).map(key => {
            const item = clientesData[key];
            if (!item) return null;

            const valor = parseFloat(item.MENSALIDADE) || 0;
            
            // Normalização de Data (Trata M/D/Y e D/M/Y)
            let vencimentoDate = null;

            if (item.VENCIMENTO) {
                const parts = item.VENCIMENTO.split('/');
                if (parts.length === 3) {
                    let day = parseInt(parts[0], 10);
                    let month = parseInt(parts[1], 10);
                    let year = parseInt(parts[2], 10);

                    // Se o "mês" for maior que 12, assume-se que é o dia (formato M/D/Y vindo do banco)
                    if (month > 12) {
                        const temp = day; day = month; month = temp;
                    }
                    
                    vencimentoDate = new Date(year, month - 1, day);
                }
            }

            // Determine status based on date (mock logic since we don't have real status)
            let status = 'Pendente';
            if (vencimentoDate) {
                if (vencimentoDate < today) status = 'Atrasado';
                else status = 'A Vencer';
            }
            // Note: 'Pago' status would come from DB in real app.

            // Metrics Calculation
            if (vencimentoDate && vencimentoDate.getMonth() === currentMonth && vencimentoDate.getFullYear() === currentYear) {
                receitaMensal += valor;
            }
            if (status === 'Atrasado') {
                atrasoVal += valor;
                atrasoCount++;
            }
            // if (status === 'Pago') ... (No data for this yet)

            return {
              id: key,
              descricao: `${item.USUARIO}`,
              valor: valor,
              valorFormatado: `R$ ${item.MENSALIDADE}`,
              tipo: item.CONTRATO,
              data: item.VENCIMENTO,
              dataObj: vencimentoDate,
              status: status
            };
          }).filter(item => item !== null);

          setTransacoes(loadedTransacoes);
          setMetrics({ receitaMensal, atrasoVal, atrasoCount, pagosVal, pagosCount });
        }
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
      }
    };

    fetchTransacoes();
  }, []);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
        if (filterTab === 'todos') return true;
        if (filterTab === 'atraso') return t.status === 'Atrasado';
        if (filterTab === 'pagos') return t.status === 'Pago';
        if (filterTab === 'a_vencer') return t.status === 'A Vencer';
        return true;
    });
  }, [transacoes, filterTab]);

  const dataGrafico = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [
      {
        label: 'Receitas',
        data: [12500, 15000, 18000, 14000, 20000, 22000],
        backgroundColor: 'rgba(30, 144, 255, 0.7)',
      },
      {
        label: 'Despesas',
        data: [8000, 9500, 10000, 8500, 11000, 10500],
        backgroundColor: 'rgba(220, 53, 69, 0.7)',
      },
    ],
  };

  const optionsGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Gestão Financeira</h2>
      <p className="cotacao-subtitle">Acompanhe o fluxo de caixa, receitas e despesas da plataforma.</p>

      <div className="dashboard-widgets">
        <div className="widget">
          <h3>Receita Total (Mês)</h3>
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

      <div className="dashboard-charts" style={{ marginTop: '30px' }}>
        <div className="chart-container" style={{ width: '100%' }}>
          <h3>Fluxo de Caixa Semestral</h3>
          <div className="chart-wrapper" style={{ height: '300px' }}>
            <Bar data={dataGrafico} options={optionsGrafico} />
          </div>
        </div>
      </div>

      <div className="faturas-section" style={{ marginTop: '30px' }}>
        <h3 className="faturas-section-title">Transações Recentes</h3>
        
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
                <th>Descrição</th><th>Tipo</th><th>Adesão</th><th>Valor</th><th>Situação</th>
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
                    <span className={`status-badge status--${trx.status.toLowerCase().replace(' ', '_')}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Financeiro;