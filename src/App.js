import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PrivacyPolicy from './pages/PrivacyPolicy';

import './App.css'; // Importa o CSS global

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/politica-de-privacidade-cm-pacatuba" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
