import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './Button'; // Reusing the Button component
import Header from '../components/Header';
import ImageHero from '../assets/images/hero.jpg';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      // 1. Criar usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Salvar dados adicionais no Realtime Database
      // Usamos o UID do usuário como chave para facilitar a busca
      await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${user.uid}.json`, {
        method: 'PUT', // PUT para definir o ID específico
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          USUARIO: name,
          EMAIL: email,
          STATUS: 'Pendente', // Status inicial
          ADESÃO: new Date().toLocaleDateString('pt-BR')
        })
      });

      alert("Cadastro realizado com sucesso!");
      navigate('/dashboard'); // Redireciona para o dashboard do cliente

    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      let msg = "Erro ao realizar cadastro.";
      if (error.code === 'auth/email-already-in-use') {
        msg = "Este e-mail já está em uso.";
      } else if (error.code === 'auth/weak-password') {
        msg = "A senha deve ter pelo menos 6 caracteres.";
      }
      alert(msg);
    }
  };

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
            <form className="auth-form" onSubmit={handleRegister}>
              <input type="text" placeholder="Nome Completo" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              <input type="email" placeholder="E-mail" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="password" placeholder="Senha" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
              <input type="password" placeholder="Confirmar Senha" required className="input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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