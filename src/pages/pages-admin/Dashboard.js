import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../../assets/images/logo GRUPO LAVORO-01.png'; // Importação mantida para passar como prop
import MenuAdmin from '../../components/menu-admin';

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="dashboard-container">
      <MenuAdmin isSidebarOpen={isSidebarOpen} Logo={Logo} />

      <main className="main-content">
        <header className="main-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>Bem-vindo, Admin!</h1>
          <div className="user-profile">
            <span>Admin</span>
            <div className="user-avatar">A</div>
          </div>
        </header>

        <div className="dashboard-widgets">
          <div className="widget">
            <h3>Visitas no Mês</h3>
            <p className="widget-value">1,234</p>
            <span className="widget-trend">+5%</span>
          </div>
          <div className="widget">
            <h3>Novos Usuários</h3>
            <p className="widget-value">56</p>
            <span className="widget-trend">+12%</span>
          </div>
          <div className="widget">
            <h3>Receita</h3>
            <p className="widget-value">R$ 5.432,10</p>
            <span className="widget-trend">-2%</span>
          </div>
          <div className="widget">
            <h3>Taxa de Rejeição</h3>
            <p className="widget-value">30%</p>
            <span className="widget-trend">+1%</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;