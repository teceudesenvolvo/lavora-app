import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import Logo from '../../assets/images/logo GRUPO LAVORO-01.png'; // Importação mantida para passar como prop
import MenuAdmin from '../../components/menu-admin';

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        // Busca o cargo do usuário na coleção equipe
        try {
          const idToken = await currentUser.getIdToken();
          const response = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${currentUser.uid}.json?auth=${idToken}`);
          const data = await response.json();
          if (data && data.cargo) {
            setUserRole(data.cargo);
          }
        } catch (error) {
          console.error("Erro ao buscar permissões do usuário:", error);
        }
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
      <MenuAdmin isSidebarOpen={isSidebarOpen} Logo={Logo} toggleSidebar={toggleSidebar} userRole={userRole} />

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