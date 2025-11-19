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

const ClientMenu = () => {
  return (
    <nav className="sidebar-nav">
      <ul>
        <li><NavLink to="/dashboard" end><FaChartPie /> Visão Geral</NavLink></li>
        <li><NavLink to="/dashboard/faturas"><FaCreditCard /> Minhas Faturas</NavLink></li>
        <li><NavLink to="/dashboard/contratos"><FaFileContract /> Meus Contratos</NavLink></li>
        <li><NavLink to="/dashboard/cotacao"><FaCommentDots /> Solicitar Cotação</NavLink></li>
        <li><NavLink to="/dashboard/documentacao"><FaFolderOpen /> Documentação</NavLink></li>
        <li><NavLink to="/dashboard/conta"><FaUserCircle /> Minha Conta</NavLink></li>
        <li><NavLink to="/dashboard/ajuda"><FaQuestionCircle /> Ajuda</NavLink></li>
      </ul>
    </nav>
  );
};

export default ClientMenu;