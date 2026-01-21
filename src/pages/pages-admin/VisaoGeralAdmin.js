import React from 'react';
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
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  // Gráfico de Evolução de Entradas de Clientes
  const clientesData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Novos Clientes',
        data: [12, 19, 15, 25, 22, 30, 35, 32, 40, 45, 50, 55],
        borderColor: 'rgb(30, 144, 255)',
        backgroundColor: 'rgba(30, 144, 255, 0.5)',
        tension: 0.4,
      },
    ],
  };

  // Gráfico de Evolução Financeira (Receitas, Custos, Lucro)
  const financeiroData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Receitas',
        data: [12000, 15000, 14000, 18000, 20000, 22000, 24000, 23000, 25000, 28000, 30000, 32000],
        backgroundColor: 'rgba(40, 167, 69, 0.7)', // Verde
      },
      {
        label: 'Custos',
        data: [8000, 9000, 8500, 10000, 11000, 12000, 13000, 12500, 14000, 15000, 16000, 17000],
        backgroundColor: 'rgba(220, 53, 69, 0.7)', // Vermelho
      },
      {
        label: 'Lucro',
        data: [4000, 6000, 5500, 8000, 9000, 10000, 11000, 10500, 11000, 13000, 14000, 15000],
        backgroundColor: 'rgba(30, 144, 255, 0.7)', // Azul
      },
    ],
  };

  return (
    <>
      <h1 className="main-header-title">Visão Geral</h1>
      <div className="dashboard-widgets">
        <div className="widget">
          <h3>Visitas no Mês</h3>
          <p className="widget-value">1,234</p>
          <span className="widget-trend">+5%</span>
        </div>
        <div className="widget">
          <h3>Novos Usuários</h3>
          <p className="widget-value">56</p>
          <span className="widget-trend">+12%</span>
        </div>
        <div className="widget">
          <h3>Receita</h3>
          <p className="widget-value">R$ 5.432,10</p>
          <span className="widget-trend">-2%</span>
        </div>
        <div className="widget">
          <h3>Taxa de Rejeição</h3>
          <p className="widget-value">30%</p>
          <span className="widget-trend">+1%</span>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Evolução de Entradas de Clientes</h3>
          <div className="chart-wrapper"><Line options={options} data={clientesData} /></div>
        </div>
        <div className="chart-container">
          <h3>Evolução Financeira (Receitas, Custos e Lucro)</h3>
          <div className="chart-wrapper"><Bar data={financeiroData} options={options} /></div>
        </div>
      </div>
    </>
  );
};

export default VisaoGeralAdmin;