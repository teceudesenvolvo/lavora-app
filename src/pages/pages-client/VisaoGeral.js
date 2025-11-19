import React from 'react';

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

      <div className="dashboard-content-placeholder">
        <div className="placeholder-card">
          <h2>Bem-vindo à sua área do cliente!</h2>
          <p>Utilize o menu ao lado para navegar entre as seções e gerenciar suas informações.</p>
        </div>
      </div>
    </>
  );
};

export default VisaoGeral;