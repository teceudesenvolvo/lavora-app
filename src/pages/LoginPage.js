import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '../firebaseConfig';
import Logo from '../assets/images/logo-GL.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCredential.user;

      // Verifica se é o admin (aceitando .com ou .com.br para garantir)
      if (user.email === 'admin@lavoroservicos.com' || user.email === 'admin@lavoroservicos.com.br') {
        navigate('/dashboard-admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      
      // Tratamento de erros detalhado para facilitar o diagnóstico
      let msg = "Falha no login.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        msg = "Usuário não encontrado. Verifique se o cadastro foi criado no Firebase Authentication.";
      } else if (error.code === 'auth/wrong-password') {
        msg = "Senha incorreta.";
      } else if (error.code === 'auth/invalid-email') {
        msg = "Formato de e-mail inválido.";
      } else if (error.code === 'auth/too-many-requests') {
        msg = "Muitas tentativas falhas. Tente novamente mais tarde.";
      }
      alert(msg);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <div className="login-card" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src={Logo} alt="Lavoro" style={{ height: '60px' }} />
            <h2 style={{ marginTop: '1rem', color: '#333' }}>Bem-vindo</h2>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="seu@email.com"
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
              placeholder="********"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
            Entrar
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <a href="/" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', marginTop: '10px', display: 'inline-block' }}>Voltar para o site</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;