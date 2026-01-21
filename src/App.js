import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/pages-admin/Dashboard';
import ClientDashboard from './pages/pages-client/Dashboard';
import CotacaoPage from './pages/pages-client/CotacaoPage';

import RegisterPage from './pages/RegisterPage';

// Páginas do Cliente
import VisaoGeralCliente from './pages/pages-client/VisaoGeral';
import FaturasCliente from './pages/pages-client/Faturas';
import ContratosCliente from './pages/pages-client/Contratos';
import DocumentacaoCliente from './pages/pages-client/Documentacao';
import MinhaContaCliente from './pages/pages-client/MinhaConta';
import AjudaCliente from './pages/pages-client/Ajuda';

// Páginas do Admin
import VisaoGeralAdmin from './pages/pages-admin/VisaoGeralAdmin';
import AnalisesAdmin from './pages/pages-admin/Analises';
import RelatoriosAdmin from './pages/pages-admin/Relatorios';
import ClientesAdmin from './pages/pages-admin/Clientes';
import ConfiguracoesAdmin from './pages/pages-admin/Configuracoes';
import Financeiro  from './pages/pages-admin/Financeiro';

import './App.css'; // Importa o CSS global
  
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/politica-de-privacidade-cm-pacatuba" element={<PrivacyPolicy />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard-admin" element={<AdminDashboard />}>
          <Route index element={<VisaoGeralAdmin />} />
          <Route path="analises" element={<AnalisesAdmin />} />
          <Route path="relatorios" element={<RelatoriosAdmin />} />
          <Route path="clientes" element={<ClientesAdmin />} />
          <Route path="configuracoes" element={<ConfiguracoesAdmin />} />
          <Route path="financeiro" element={<Financeiro />} />
        </Route>
        <Route path="/dashboard" element={<ClientDashboard />}>
          <Route index element={<VisaoGeralCliente />} />
          <Route path="faturas" element={<FaturasCliente />} />
          <Route path="contratos" element={<ContratosCliente />} />
          <Route path="cotacao" element={<CotacaoPage />} />
          <Route path="documentacao" element={<DocumentacaoCliente />} />
          <Route path="conta" element={<MinhaContaCliente />} />
          <Route path="ajuda" element={<AjudaCliente />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
