import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button'; // Reusing the Button component
import Header from '../components/Header';
import ImageHero from '../assets/images/hero.jpg';

// Footer Component (copied from Home.js for layout consistency)
const Footer = () => (
    <footer className="footer-section">
        <div className="footer-links">
            <Link to="/#hero">Início</Link>
            <Link to="/#about">Sobre Nós</Link>
            <Link to="/#solutions">Soluções</Link>
            <Link to="/#gallery">Portfólio</Link> {/* Assuming a gallery section exists */}
            <Link to="/#contact">Contato</Link>
        </div>
       
        <p className="copyright">
            Grupo Lavoro © 2025. Todos os Direitos Reservados.
        </p>
    </footer>
);

const RegisterPage = () => {
  return (
    <div className="lavoro-app-container">
      <Header />
      <main className="auth-main">
        <div className="auth-image-container">
          <img src={ImageHero} alt="Mulher utilizando óculos de realidade virtual" className="auth-image" />
        </div>
        <div className="auth-form-container">
          <div className="auth-container">
            <h2 className="section-title">Cadastro</h2>
            <p className="section-subtitle">Crie sua conta para explorar nossos serviços.</p>
            <form className="auth-form">
              <input type="text" placeholder="Nome Completo" required className="input-field" />
              <input type="email" placeholder="E-mail" required className="input-field" />
              <input type="password" placeholder="Senha" required className="input-field" />
              <input type="password" placeholder="Confirmar Senha" required className="input-field" />
              <Button primary type="submit" className="auth-button">Cadastrar</Button>
            </form>
            <p className="auth-link-text">
              Já tem uma conta? <Link to="/login">Faça login</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;