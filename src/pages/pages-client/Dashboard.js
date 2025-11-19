import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ClientMenu from '../../components/menu-client';

const ClientDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        
        <ClientMenu />
        <div className="sidebar-footer">
            <Link to="/login"><span>🚪</span> Sair</Link>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>Minha Área</h1>
          <div className="user-profile">
            <span>Cliente</span>
            <div className="user-avatar">C</div>
          </div>
        </header>

        {/* Conteúdo de exemplo para o cliente */}
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
            <p>Aqui você pode visualizar suas faturas, acompanhar seus contratos, solicitar novas cotações e muito mais.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;