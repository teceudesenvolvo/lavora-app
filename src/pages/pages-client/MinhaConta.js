import React, { useState } from 'react';

const MinhaConta = () => {
  // Dados de exemplo do usuário (em um app real, viria do estado global/API)
  const [userData, setUserData] = useState({
    nome: 'João da Silva',
    email: 'joao.silva@example.com',
    telefone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    endereco: 'Rua das Flores, 123, São Paulo - SP'
  });

  const [passwordData, setPasswordData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para salvar os dados do usuário
    console.log('Dados do usuário para salvar:', userData);

    // Lógica para alterar a senha (com validação)
    if (passwordData.novaSenha || passwordData.senhaAtual) {
      if (passwordData.novaSenha !== passwordData.confirmarSenha) {
        alert('A nova senha e a confirmação não correspondem.');
        return;
      }
      console.log('Dados de senha para alterar:', passwordData);
      alert('Dados e senha atualizados com sucesso!');
    } else {
      alert('Dados atualizados com sucesso!');
    }
  };

  return (
    <div className="minha-conta-container">
      <form onSubmit={handleSubmit}>
        <div className="profile-section">
          <h2 className="faturas-section-title">Meus Dados</h2>
          <div className="profile-form">
            <div className="form-group"><label htmlFor="nome">Nome Completo</label><input type="text" id="nome" name="nome" value={userData.nome} onChange={handleUserChange} required /></div>
            <div className="form-group"><label htmlFor="email">E-mail</label><input type="email" id="email" name="email" value={userData.email} onChange={handleUserChange} required /></div>
            <div className="form-group"><label htmlFor="telefone">Telefone</label><input type="tel" id="telefone" name="telefone" value={userData.telefone} onChange={handleUserChange} /></div>
            <div className="form-group"><label htmlFor="cpf">CPF</label><input type="text" id="cpf" name="cpf" value={userData.cpf} onChange={handleUserChange} /></div>
            <div className="form-group full-width"><label htmlFor="endereco">Endereço</label><input type="text" id="endereco" name="endereco" value={userData.endereco} onChange={handleUserChange} /></div>
          </div>
        </div>
        <div style={{ height: '20px' }}></div>
        <div className="profile-section">
          <h2 className="faturas-section-title">Alterar Senha</h2>
          <div className="profile-form">
            <div className="form-group"><label htmlFor="senhaAtual">Senha Atual</label><input type="password" id="senhaAtual" name="senhaAtual" value={passwordData.senhaAtual} onChange={handlePasswordChange} /></div>
            <div className="form-group"><label htmlFor="novaSenha">Nova Senha</label><input type="password" id="novaSenha" name="novaSenha" value={passwordData.novaSenha} onChange={handlePasswordChange} /></div>
            <div className="form-group"><label htmlFor="confirmarSenha">Confirmar Nova Senha</label><input type="password" id="confirmarSenha" name="confirmarSenha" value={passwordData.confirmarSenha} onChange={handlePasswordChange} /></div>
            <button type="submit" className="btn btn-primary auth-button">Salvar Alterações</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MinhaConta;