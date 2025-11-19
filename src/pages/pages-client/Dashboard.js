import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import ClientMenu from '../../components/menu-client';
import Logo from '../../assets/images/logo GRUPO LAVORO-01.png';
import { FaSignOutAlt } from 'react-icons/fa';

const ClientDashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container">
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="Lavoro" className="dashboard-logo" />
        </div>
        <ClientMenu toggleSidebar={toggleSidebar} />
        <div className="sidebar-footer">
            <Link to="/login"><FaSignOutAlt /> Sair</Link>
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

        {/* O Outlet renderiza o componente da rota filha correspondente */}
        <Outlet />
      </main>
    </div>
  );
};

export default ClientDashboard;