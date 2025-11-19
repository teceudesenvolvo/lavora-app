import React from 'react';
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

const VisaoGeralAdmin = () => {
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
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
  );
};

export default VisaoGeralAdmin;