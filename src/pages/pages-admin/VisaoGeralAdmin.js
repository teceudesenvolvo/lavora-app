import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const VisaoGeralAdmin = () => {
  const [metrics, setMetrics] = useState({
    totalClientes: 0,
    novosClientesMes: 0,
    receitaMes: 0,
    cotacoesPendentes: 0
  });

  const [clientesChartData, setClientesChartData] = useState({
    labels: [],
    datasets: []
  });

  const [financeiroChartData, setFinanceiroChartData] = useState({
    labels: [],
    datasets: []
  });

  const [loading, setLoading] = useState(true);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resClientes, resCobrancas] = await Promise.all([
          fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json'),
          fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/cobrancas.json')
        ]);

        const dataClientes = await resClientes.json();
        const dataCobrancas = await resCobrancas.json();

        const clientes = dataClientes?.Clientes || dataClientes || {};
        const cobrancas = dataCobrancas || {};

        processData(clientes, cobrancas);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (clientes, cobrancas) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const fullMonthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

    let totalClientes = 0;
    let novosClientesMes = 0;
    let receitaMes = 0;
    let cotacoesPendentes = 0;

    const newClientsPerMonth = Array(12).fill(0);
    const revenuePerMonth = Array(12).fill(0);
    const costsPerMonth = Array(12).fill(5000); // Custo fixo simulado (pode ser ajustado nas configurações futuramente)
    const profitPerMonth = Array(12).fill(0);

    // Processar Clientes
    Object.values(clientes).forEach(cliente => {
        if (!cliente) return;
        totalClientes++;

        // Novos Clientes (ADESÃO)
        if (cliente['ADESÃO']) {
            const parts = cliente['ADESÃO'].split('/');
            if (parts.length === 3) {
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                
                if (year === currentYear) {
                    newClientsPerMonth[month]++;
                    if (month === currentMonth) novosClientesMes++;
                }
            }
        }

        // Cotações Pendentes
        if (cliente.cotacoes) {
            const cots = Array.isArray(cliente.cotacoes) ? cliente.cotacoes : Object.values(cliente.cotacoes);
            cots.forEach(c => {
                if (c.status === 'Em Análise' || c.status === 'Enviada') cotacoesPendentes++;
            });
        }

        // Receita de Assinaturas (Histórico de Pagamentos)
        if (cliente.dataPagamento) {
            const history = Array.isArray(cliente.dataPagamento) ? cliente.dataPagamento : Object.values(cliente.dataPagamento);
            history.forEach(entry => {
                if (typeof entry === 'string') {
                    // Ex: "janeiro: 10/01/2026"
                    const entryParts = entry.split(':');
                    if (entryParts.length >= 2) {
                        const monthName = entryParts[0].trim().toLowerCase();
                        const datePart = entryParts[1].trim().split(' - ')[0]; 
                        const dateObjParts = datePart.split('/');
                        
                        if (dateObjParts.length === 3) {
                            const year = parseInt(dateObjParts[2], 10);
                            if (year === currentYear) {
                                const monthIndex = fullMonthNames.indexOf(monthName);
                                if (monthIndex !== -1) {
                                    const valor = parseFloat(cliente.MENSALIDADE) || 0;
                                    revenuePerMonth[monthIndex] += valor;
                                    if (monthIndex === currentMonth) receitaMes += valor;
                                }
                            }
                        }
                    }
                }
            });
        }
    });

    // Processar Cobranças Avulsas
    Object.values(cobrancas).forEach(cobranca => {
        if (cobranca.status === 'Pago' && cobranca.dataPagamento) {
            const parts = cobranca.dataPagamento.split('/');
            if (parts.length === 3) {
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                const valor = parseFloat(cobranca.valor) || 0;

                if (year === currentYear) {
                    revenuePerMonth[month] += valor;
                    if (month === currentMonth) receitaMes += valor;
                }
            }
        }
    });

    // Calcular Lucro
    for (let i = 0; i < 12; i++) {
        profitPerMonth[i] = revenuePerMonth[i] - costsPerMonth[i];
    }

    setMetrics({
        totalClientes,
        novosClientesMes,
        receitaMes,
        cotacoesPendentes
    });

    setClientesChartData({
        labels: months,
        datasets: [{
            label: 'Novos Clientes',
            data: newClientsPerMonth,
            borderColor: 'rgb(30, 144, 255)',
            backgroundColor: 'rgba(30, 144, 255, 0.5)',
            tension: 0.4,
        }]
    });

    setFinanceiroChartData({
        labels: months,
        datasets: [
            { label: 'Receitas', data: revenuePerMonth, backgroundColor: 'rgba(40, 167, 69, 0.7)' },
            { label: 'Custos (Fixo)', data: costsPerMonth, backgroundColor: 'rgba(220, 53, 69, 0.7)' },
            { label: 'Lucro', data: profitPerMonth, backgroundColor: 'rgba(30, 144, 255, 0.7)' },
        ]
    });
  };

  if (loading) {
      return <div style={{padding: '20px'}}>Carregando dados...</div>;
  }

  return (
    <>
      <h1 className="main-header-title">Visão Geral</h1>
      <div className="dashboard-widgets">
        <div className="widget">
          <h3>Total de Clientes</h3>
          <p className="widget-value">{metrics.totalClientes}</p>
          <span className="widget-trend">Ativos na base</span>
        </div>
        <div className="widget">
          <h3>Novos (Mês)</h3>
          <p className="widget-value">{metrics.novosClientesMes}</p>
          <span className="widget-trend">Cadastros este mês</span>
        </div>
        <div className="widget">
          <h3>Receita (Mês)</h3>
          <p className="widget-value">R$ {metrics.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span className="widget-trend">Pagamentos confirmados</span>
        </div>
        <div className="widget">
          <h3>Cotações Pendentes</h3>
          <p className="widget-value">{metrics.cotacoesPendentes}</p>
          <span className="widget-trend">Aguardando análise</span>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Evolução de Entradas de Clientes ({new Date().getFullYear()})</h3>
          <div className="chart-wrapper"><Line options={options} data={clientesChartData} /></div>
        </div>
        <div className="chart-container">
          <h3>Evolução Financeira ({new Date().getFullYear()})</h3>
          <div className="chart-wrapper"><Bar data={financeiroChartData} options={options} /></div>
        </div>
      </div>
    </>
  );
};

export default VisaoGeralAdmin;