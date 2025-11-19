import React from 'react';
import { NavLink } from 'react-router-dom';


import {
  FaChartPie,
  FaCreditCard,
  FaFileContract,
  FaCommentDots,
  FaFolderOpen,
  FaUserCircle,
  FaQuestionCircle,
} from 'react-icons/fa';

const ClientMenu = ({ toggleSidebar }) => {
  return (
    <nav className="sidebar-nav">
      <ul>
        <li><NavLink to="/dashboard" end onClick={toggleSidebar}><FaChartPie /> Visão Geral</NavLink></li>
        <li><NavLink to="/dashboard/faturas" onClick={toggleSidebar}><FaCreditCard /> Minhas Faturas</NavLink></li>
        <li><NavLink to="/dashboard/contratos" onClick={toggleSidebar}><FaFileContract /> Meus Contratos</NavLink></li>
        <li><NavLink to="/dashboard/cotacao" onClick={toggleSidebar}><FaCommentDots /> Solicitar Cotação</NavLink></li>
        <li><NavLink to="/dashboard/documentacao" onClick={toggleSidebar}><FaFolderOpen /> Documentação</NavLink></li>
        <li><NavLink to="/dashboard/conta" onClick={toggleSidebar}><FaUserCircle /> Minha Conta</NavLink></li>
        <li><NavLink to="/dashboard/ajuda" onClick={toggleSidebar}><FaQuestionCircle /> Ajuda</NavLink></li>
      </ul>
    </nav>
  );
};

export default ClientMenu;