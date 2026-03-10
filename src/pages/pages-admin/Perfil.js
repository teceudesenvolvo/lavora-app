import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaSpinner } from 'react-icons/fa';
import { auth } from '../../firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from 'firebase/auth';

const Perfil = () => {
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    cargo: '',
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${user.uid}.json?auth=${idToken}`);
          const data = await response.json();
          if (data) {
            setUserData(prev => ({
              ...prev,
              nome: data.nome || user.displayName || '',
              email: user.email || '',
              cargo: data.cargo || ''
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar dados do perfil:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const user = auth.currentUser;

    try {
      // 1. Atualizar Nome no Database e Auth se mudou
      if (userData.nome && userData.nome !== user.displayName) {
         await updateProfile(user, { displayName: userData.nome });
         const idToken = await user.getIdToken();
         await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${user.uid}.json?auth=${idToken}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: userData.nome })
         });
      }

      // 2. Alterar Senha se fornecida
      if (userData.novaSenha) {
        if (userData.novaSenha !== userData.confirmarSenha) {
          alert("A nova senha e a confirmação não coincidem.");
          setIsLoading(false);
          return;
        }
        if (!userData.senhaAtual) {
          alert("Por favor, informe a senha atual para realizar a alteração.");
          setIsLoading(false);
          return;
        }

        const credential = EmailAuthProvider.credential(user.email, userData.senhaAtual);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, userData.novaSenha);
        setUserData(prev => ({ ...prev, senhaAtual: '', novaSenha: '', confirmarSenha: '' }));
        alert("Perfil atualizado e senha alterada com sucesso!");
      } else {
        alert("Perfil atualizado com sucesso!");
      }

    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar perfil: " + (error.code === 'auth/wrong-password' ? "Senha atual incorreta." : error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Meu Perfil</h2>
      <p className="cotacao-subtitle">Gerencie suas informações pessoais e de segurança.</p>

      <form onSubmit={handleSave} className="settings-form">
        <fieldset className="settings-fieldset">
            <legend><FaUser /> Dados Pessoais</legend>
            <div className="form-group">
                <label>Nome Completo</label>
                <input name="nome" value={userData.nome} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>E-mail</label>
                <input value={userData.email} disabled style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
                <label>Cargo</label>
                <input value={userData.cargo} disabled style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }} />
            </div>
        </fieldset>

        <fieldset className="settings-fieldset">
            <legend><FaLock /> Alterar Senha</legend>
            <div className="form-group">
                <label>Senha Atual</label>
                <input type="password" name="senhaAtual" value={userData.senhaAtual} onChange={handleChange} placeholder="Necessário apenas para trocar a senha" />
            </div>
            <div className="form-group">
                <label>Nova Senha</label>
                <input type="password" name="novaSenha" value={userData.novaSenha} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input type="password" name="confirmarSenha" value={userData.confirmarSenha} onChange={handleChange} />
            </div>
        </fieldset>

        <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isLoading ? <FaSpinner className="icon-spin" /> : null}
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default Perfil;
