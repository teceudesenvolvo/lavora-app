import React, { useState, useEffect } from 'react';
import { FaBell, FaMoneyBillWave, FaLock, FaSpinner } from 'react-icons/fa';
import { auth } from '../../firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

const Configuracoes = () => {
  // Estado para armazenar as configurações, com valores padrão
  const [settings, setSettings] = useState({
    reajusteAnual: '5.00',
    notificationEmail: 'admin@lavoro.com',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar configurações do Firebase ao montar
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/configuracoes.json');
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setSettings(prev => ({
              ...prev,
              reajusteAnual: data.reajusteAnual || '5.00',
              notificationEmail: data.notificationEmail || 'admin@lavoro.com'
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    };
    fetchSettings();
  }, []);

  // Manipulador para atualizar o estado quando um campo muda
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // 1. Salvar Configurações Gerais (Database)
      try {
        await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/configuracoes.json', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reajusteAnual: settings.reajusteAnual,
            notificationEmail: settings.notificationEmail
          })
        });
      } catch (error) {
        console.error("Erro ao salvar configurações gerais:", error);
        alert("Erro ao salvar configurações gerais.");
        return;
      }

      // 2. Alterar Senha (Auth) se fornecida
      if (settings.novaSenha) {
        if (settings.novaSenha !== settings.confirmarSenha) {
          alert("A nova senha e a confirmação não coincidem.");
          return;
        }
        if (!settings.senhaAtual) {
          alert("Por favor, informe a senha atual para realizar a alteração.");
          return;
        }

        const user = auth.currentUser;
        if (user) {
          const credential = EmailAuthProvider.credential(user.email, settings.senhaAtual);
          try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, settings.novaSenha);
            alert("Configurações salvas e senha alterada com sucesso!");
            setSettings(prev => ({ ...prev, senhaAtual: '', novaSenha: '', confirmarSenha: '' }));
          } catch (error) {
            console.error("Erro ao alterar senha:", error);
            alert("Erro ao alterar senha: " + (error.code === 'auth/wrong-password' ? "Senha atual incorreta." : error.message));
          }
        } else {
          alert("Usuário não autenticado. Faça login novamente.");
        }
      } else {
         alert('Configurações salvas com sucesso!');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyReajuste = async () => {
    const percentage = parseFloat(settings.reajusteAnual);
    if (isNaN(percentage) || percentage <= 0) {
      alert("Por favor, defina uma porcentagem de reajuste válida.");
      return;
    }

    if (!window.confirm(`ATENÇÃO: Isso aumentará a mensalidade de TODOS os clientes em ${percentage}%. Essa ação não pode ser desfeita automaticamente.\n\nDeseja continuar?`)) {
      return;
    }

    const password = window.prompt("Por favor, digite sua senha para confirmar esta operação crítica:");
    if (!password) return;

    setIsLoading(true);
    const user = auth.currentUser;
    if (!user) {
      alert("Erro: Usuário não autenticado.");
      setIsLoading(false);
      return;
    }

    try {
      // Reautenticar para garantir segurança antes de alterar dados em massa
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      console.error("Erro de autenticação:", error);
      alert("Senha incorreta. A operação foi cancelada.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json');
      const data = await response.json();
      const clientesData = (data && data.Clientes) ? data.Clientes : data;

      if (!clientesData) {
        alert("Nenhum cliente encontrado para aplicar o reajuste.");
        return;
      }

      const updates = [];
      Object.keys(clientesData).forEach(key => {
        const cliente = clientesData[key];
        if (cliente && cliente.MENSALIDADE) {
          const currentVal = parseFloat(cliente.MENSALIDADE);
          if (!isNaN(currentVal)) {
            const newVal = (currentVal * (1 + percentage / 100)).toFixed(2);
            updates.push(
              fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${key}.json`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ MENSALIDADE: newVal })
              })
            );
          }
        }
      });

      await Promise.all(updates);

      // Salva o valor do reajuste aplicado nas configurações do Firebase
      await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/configuracoes.json', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reajusteAnual: settings.reajusteAnual })
      });

      alert(`Reajuste de ${percentage}% aplicado com sucesso em ${updates.length} clientes!`);
    } catch (error) {
      console.error("Erro ao aplicar reajuste:", error);
      alert("Erro ao processar o reajuste.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-section">
      {isLoading && (
        <div className="popup-overlay" style={{ zIndex: 9999, flexDirection: 'column', color: '#fff' }}>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .icon-spin { animation: spin 1s linear infinite; }`}
          </style>
          <FaSpinner className="icon-spin" size={60} />
          <h2 style={{ marginTop: '20px', color: '#fff' }}>Processando...</h2>
          <p style={{ color: '#eee' }}>Por favor, aguarde e não feche a página.</p>
        </div>
      )}

      <h2 className="faturas-section-title">Configurações do Sistema</h2>
      <p className="cotacao-subtitle">Gerencie parâmetros financeiros, segurança e conteúdo da plataforma.</p>

      <form onSubmit={handleSave} className="settings-form">
        {/* Seção Financeira */}
        <fieldset className="settings-fieldset">
          <legend><FaMoneyBillWave /> Configurações Financeiras</legend>
          <div className="form-group">
            <label htmlFor="reajusteAnual">Reajuste Anual Padrão (%)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="number" id="reajusteAnual" name="reajusteAnual" value={settings.reajusteAnual} onChange={handleChange} step="0.01" placeholder="Ex: 5.00" style={{ flex: 1 }} />
              <button type="button" onClick={handleApplyReajuste} className="btn btn-secondary" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }} disabled={isLoading}>
                {isLoading ? <FaSpinner className="icon-spin" /> : null}
                {isLoading ? 'Aplicando...' : 'Aplicar Reajuste'}
              </button>
            </div>
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
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
            {isLoading ? <FaSpinner className="icon-spin" /> : null}
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

    </div>
  );
};

export default Configuracoes;