import React from 'react';
import Logo from '../assets/images/logo GRUPO LAVORO-01.png';

import { Link } from 'react-router-dom';

const ClientMenu = () => {
  return (

    <nav className="sidebar-nav">
      <div className="sidebar-header">
        <img src={Logo} alt="Lavoro" className="dashboard-logo" />
      </div>
      <ul>
        <li><Link to="#faturas" className="active"><span>💳</span> Minhas Faturas</Link></li>
        <li><Link to="#contratos"><span>📝</span> Meus Contratos</Link></li>
        <li><Link to="#cotacao"><span>💬</span> Solicitar Cotação</Link></li>
        <li><Link to="#documentacao"><span>📂</span> Documentação</Link></li>
        <li><Link to="#conta"><span>👤</span> Minha Conta</Link></li>
        <li><Link to="#ajuda"><span>❓</span> Ajuda</Link></li>
      </ul>
    </nav>
  );
};

export default ClientMenu;