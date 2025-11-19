import React from 'react';

import {
  FaChartPie,
  FaChartLine,
  FaFileAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';

const MenuAdmin = ({ isSidebarOpen, Logo }) => {
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="Lavoro" className="dashboard-logo" />
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><a href="#overview" className="active"><FaChartPie /> Visão Geral</a></li>
            <li><a href="#analytics"><FaChartLine /> Análises</a></li>
            <li><a href="#reports"><FaFileAlt /> Relatórios</a></li>
            <li><a href="#users"><FaUsers /> Clientes</a></li>
            <li><a href="#settings"><FaCog /> Configurações</a></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
            <a href="#logout"><FaSignOutAlt /> Sair</a>
        </div>
      </aside>
  );
};

export default MenuAdmin;