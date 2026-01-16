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
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
      <MenuAdmin isSidebarOpen={isSidebarOpen} Logo={Logo} toggleSidebar={toggleSidebar} />

      <main className="main-content">
        <header className="main-header">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            ☰
          </button>
          <div className="user-profile">
            <span>Admin</span>
            <div className="user-avatar">A</div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;