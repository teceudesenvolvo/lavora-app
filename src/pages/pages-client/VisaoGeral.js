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

const VisaoGeral = () => {
  return (
    <>
      <div className="dashboard-widgets">
        <div className="widget">
          <h3>Faturas em Aberto</h3>
          <p className="widget-value">2</p>
          <span className="widget-trend" style={{backgroundColor: '#f8d7da', color: '#721c24'}}>Vencem este mês</span>
        </div>
        <div className="widget">
          <h3>Contratos Ativos</h3>
          <p className="widget-value">3</p>
        </div>
        <div className="widget">
          <h3>Última Cotação</h3>
          <p className="widget-value">R$ 1.500,00</p>
          <span className="widget-trend" style={{backgroundColor: '#d1ecf1', color: '#0c5460'}}>Em análise</span>
        </div>
        <div className="widget">
          <h3>Documentos Pendentes</h3>
          <p className="widget-value">1</p>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Histórico de Pagamentos (Últimos 6 meses)</h3>
          <div className="chart-wrapper">
            <Line 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
              }} 
              data={{
                labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [{
                  label: 'Valor Pago (R$)',
                  data: [485, 485, 485, 510, 510, 510],
                  borderColor: 'rgb(30, 144, 255)',
                  backgroundColor: 'rgba(30, 144, 255, 0.5)',
                }],
              }} 
            />
          </div>
        </div>
        <div className="chart-container">
          <h3>Distribuição de Gastos</h3>
          <div className="chart-wrapper">
            <Pie 
              data={{
                labels: ['Mensalidade', 'Coparticipação', 'Outros'],
                datasets: [{
                  data: [450, 35, 25],
                  backgroundColor: [
                    'rgba(30, 144, 255, 0.8)',
                    'rgba(0, 191, 255, 0.8)',
                    'rgba(154, 152, 255, 0.8)',
                  ],
                  borderColor: '#ffffff',
                }],
              }} 
              options={{ responsive: true, maintainAspectRatio: false }} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VisaoGeral;