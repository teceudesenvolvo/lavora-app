import React from 'react';

const MenuAdmin = ({ isSidebarOpen, Logo }) => {
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="Lavoro" className="dashboard-logo" />
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#overview" className="active"><span>📊</span> Visão Geral</a></li>
            <li><a href="#analytics"><span>📈</span> Análises</a></li>
            <li><a href="#reports"><span>📄</span> Relatórios</a></li>
            <li><a href="#users"><span>👥</span> Usuários</a></li>
            <li><a href="#settings"><span>⚙️</span> Configurações</a></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
            <a href="#logout"><span>🚪</span> Sair</a>
        </div>
      </aside>
  );
};

export default MenuAdmin;