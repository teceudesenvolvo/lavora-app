import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="footer-section">
        <div className="footer-links">
            <Link to="/">Início</Link>
            <Link to="/about">Sobre Nós</Link>
            <Link to="/solutions">Soluções</Link>
            <Link to="/#gallery">Portfólio</Link>
            <Link to="/contact">Contato</Link>
        </div>
       
        <p className="copyright">
            Grupo Lavoro © 2025. Todos os Direitos Reservados.
        </p>
    </footer>
);

export default Footer;