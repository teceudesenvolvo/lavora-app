import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import {
  FaChartPie,
  FaChartLine,
  // FaFileAlt,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaWallet,
  FaUserShield,
  FaUser,
} from 'react-icons/fa';

const MenuAdmin = ({ isSidebarOpen, Logo, toggleSidebar, userRole }) => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="Lavoro" className="dashboard-logo" />
        </div>
        <nav className="sidebar-nav">
          <ul>
            {userRole !== 'Vendedor' && userRole !== 'Financeiro' && (
              <li><NavLink to="/dashboard-admin" end onClick={toggleSidebar}><FaChartPie /> Visão Geral</NavLink></li>
            )}
            {userRole !== 'Financeiro' && (
              <li><NavLink to="/dashboard-admin/analises" onClick={toggleSidebar}><FaChartLine /> Análises</NavLink></li>
            )}
            <li><NavLink to="/dashboard-admin/clientes" onClick={toggleSidebar}><FaUsers /> Clientes</NavLink></li>
            {userRole !== 'Vendedor' && userRole !== 'Financeiro' && (
              <li><NavLink to="/dashboard-admin/equipe" onClick={toggleSidebar}><FaUserShield /> Equipe</NavLink></li>
            )}
            {userRole !== 'Vendedor' && (
              <li><NavLink to="/dashboard-admin/financeiro" onClick={toggleSidebar}><FaWallet /> Financeiro</NavLink></li>
            )}
            {userRole !== 'Vendedor' && userRole !== 'Financeiro' && (
              <li><NavLink to="/dashboard-admin/configuracoes" onClick={toggleSidebar}><FaCog /> Configurações</NavLink></li>
            )}
            <li><NavLink to="/dashboard-admin/perfil" onClick={toggleSidebar}><FaUser /> Perfil</NavLink></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
            <a href="/" onClick={handleLogout}><FaSignOutAlt /> Sair</a>
        </div>
      </aside>
  );
};

export default MenuAdmin;