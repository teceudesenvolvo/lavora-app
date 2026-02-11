import React, { useState } from 'react';
import { FaBell, FaMoneyBillWave, FaLock } from 'react-icons/fa';

const Configuracoes = () => {
  // Estado para armazenar as configurações, com valores padrão
  const [settings, setSettings] = useState({
    reajusteAnual: '5.00',
    notificationEmail: 'admin@lavoro.com',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Manipulador para atualizar o estado quando um campo muda
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Manipulador para o envio do formulário
  const handleSave = (e) => {
    e.preventDefault();
    // Em um cenário real, você enviaria os dados para uma API
    console.log('Configurações salvas:', settings);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Configurações do Sistema</h2>
      <p className="cotacao-subtitle">Gerencie parâmetros financeiros, segurança e conteúdo da plataforma.</p>

      <form onSubmit={handleSave} className="settings-form">
        {/* Seção Financeira */}
        <fieldset className="settings-fieldset">
          <legend><FaMoneyBillWave /> Configurações Financeiras</legend>
          <div className="form-group">
            <label htmlFor="reajusteAnual">Reajuste Anual Padrão (%)</label>
            <input type="number" id="reajusteAnual" name="reajusteAnual" value={settings.reajusteAnual} onChange={handleChange} step="0.01" placeholder="Ex: 5.00" />
            <small>Percentual sugerido para renovação automática de contratos.</small>
          </div>
        </fieldset>

        {/* Seção de Segurança */}
        <fieldset className="settings-fieldset">
          <legend><FaLock /> Alterar Senha</legend>
          <div className="form-group">
            <label htmlFor="senhaAtual">Senha Atual</label>
            <input type="password" id="senhaAtual" name="senhaAtual" value={settings.senhaAtual} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="novaSenha">Nova Senha</label>
            <input type="password" id="novaSenha" name="novaSenha" value={settings.novaSenha} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
            <input type="password" id="confirmarSenha" name="confirmarSenha" value={settings.confirmarSenha} onChange={handleChange} />
          </div>
        </fieldset>

        {/* Seção de Notificações */}
        <fieldset className="settings-fieldset">
          <legend><FaBell /> Notificações</legend>
          <div className="form-group">
            <label htmlFor="notificationEmail">E-mail para Notificações</label>
            <input type="email" id="notificationEmail" name="notificationEmail" value={settings.notificationEmail} onChange={handleChange} />
            <small>Este e-mail receberá alertas sobre novas cotações e novos usuários.</small>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar Alterações
          </button>
        </div>
      </form>

    </div>
  );
};

export default Configuracoes;