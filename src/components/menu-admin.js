import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaChartPie,
  FaChartLine,
  FaFileAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';

const MenuAdmin = ({ isSidebarOpen, Logo, toggleSidebar }) => {
  return (
    <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="Lavoro" className="dashboard-logo" />
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><NavLink to="/dashboard-admin" end onClick={toggleSidebar}><FaChartPie /> Visão Geral</NavLink></li>
            <li><NavLink to="/dashboard-admin/analises" onClick={toggleSidebar}><FaChartLine /> Análises</NavLink></li>
            <li><NavLink to="/dashboard-admin/relatorios" onClick={toggleSidebar}><FaFileAlt /> Relatórios</NavLink></li>
            <li><NavLink to="/dashboard-admin/clientes" onClick={toggleSidebar}><FaUsers /> Clientes</NavLink></li>
            <li><NavLink to="/dashboard-admin/configuracoes" onClick={toggleSidebar}><FaCog /> Configurações</NavLink></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
            <a href="#logout"><FaSignOutAlt /> Sair</a>
        </div>
      </aside>
  );
};

export default MenuAdmin;