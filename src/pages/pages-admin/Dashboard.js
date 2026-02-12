import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Logo from '../../assets/images/logo GRUPO LAVORO-01.png'; // Importação mantida para passar como prop
import MenuAdmin from '../../components/menu-admin';

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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
            <span>{user ? user.email : 'Carregando...'}</span>
            <div className="user-avatar">{user && user.email ? user.email.charAt(0).toUpperCase() : 'A'}</div>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;