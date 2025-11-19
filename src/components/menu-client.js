import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/logo-GL.png';

import {
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
      <div className="sidebar-header">
        <img src={Logo} alt="Lavoro" className="dashboard-logo" />
      </div>
      <ul>
        <li><Link to="#faturas" className="active"><FaCreditCard /> Minhas Faturas</Link></li>
        <li><Link to="#contratos"><FaFileContract /> Meus Contratos</Link></li>
        <li><Link to="#cotacao"><FaCommentDots /> Solicitar Cotação</Link></li>
        <li><Link to="#documentacao"><FaFolderOpen /> Documentação</Link></li>
        <li><Link to="#conta"><FaUserCircle /> Minha Conta</Link></li>
        <li><Link to="#ajuda"><FaQuestionCircle /> Ajuda</Link></li>
      </ul>
    </nav>
  );
};

export default ClientMenu;