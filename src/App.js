import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/pages-admin/Dashboard';
import RegisterPage from './pages/RegisterPage';

// Importando páginas do cliente
import ClientDashboard from './pages/pages-client/Dashboard';

import './App.css'; // Importa o CSS global
  
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/politica-de-privacidade-cm-pacatuba" element={<PrivacyPolicy />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard-admin" element={<AdminDashboard />} />
        {/* Rota para o cliente */}
        <Route path="/dashboard" element={<ClientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
