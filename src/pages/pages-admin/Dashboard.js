import React, { useState } from 'react';
import Logo from '../../assets/images/logo GRUPO LAVORO-01.png'; // Importação mantida para passar como prop
import MenuAdmin from '../../components/menu-admin';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const lineChartData = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho'],
        datasets: [
          {
            label: 'Usuários',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: 'rgb(30, 144, 255)',
            backgroundColor: 'rgba(30, 144, 255, 0.5)',
          },
        ],
      };

      const pieChartData = {
        labels: ['Desktop', 'Mobile', 'Tablet'],
        datasets: [
          {
            label: 'Acessos por Dispositivo',
            data: [300, 150, 50],
            backgroundColor: [
              'rgba(30, 144, 255, 0.8)',
              'rgba(0, 191, 255, 0.8)',
              'rgba(154, 152, 255, 0.8)',
            ],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      };

  return (
    <div className="dashboard-container">
      <MenuAdmin isSidebarOpen={isSidebarOpen} Logo={Logo} />

      <main className="main-content">
        <header className="main-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>Bem-vindo, Admin!</h1>
          <div className="user-profile">
            <span>Admin</span>
            <div className="user-avatar">A</div>
          </div>
        </header>

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
            <h3>Estatísticas de Crescimento</h3>
            <div className="chart-wrapper"><Line options={lineChartOptions} data={lineChartData} /></div>
          </div>
          <div className="chart-container">
            <h3>Distribuição de Usuários</h3>
            <div className="chart-wrapper"><Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;