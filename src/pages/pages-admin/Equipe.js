import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEnvelope, FaIdBadge } from 'react-icons/fa';

const Equipe = () => {
  const [equipe, setEquipe] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Se null, é modo criação
  const [formData, setFormData] = useState({ nome: '', email: '', cargo: 'Vendedor', status: 'Ativo' });

  // URL do Firebase para a equipe
  const FIREBASE_URL = 'https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe.json';
  // URL base das Cloud Functions
  const CLOUD_FUNCTIONS_BASE = 'https://us-central1-lavoro-servicos-c10fd.cloudfunctions.net';

  useEffect(() => {
    fetchEquipe();
  }, []);

  const fetchEquipe = async () => {
    try {
      const response = await fetch(FIREBASE_URL);
      const data = await response.json();
      if (data) {
        const loadedEquipe = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setEquipe(loadedEquipe);
      } else {
        setEquipe([]);
      }
    } catch (error) {
      console.error("Erro ao buscar equipe:", error);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({ 
        nome: user.nome, 
        email: user.email, 
        cargo: user.cargo, 
        status: user.status
      });
    } else {
      setCurrentUser(null);
      setFormData({ nome: '', email: '', cargo: 'Vendedor', status: 'Ativo' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const payload = {
      nome: formData.nome,
      email: formData.email,
      cargo: formData.cargo,
      status: formData.status
    };

    try {
      if (currentUser) {
        // Edição
        await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${currentUser.id}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('Usuário atualizado com sucesso!');
      } else {
        // Criação
        // 1. Chama a Cloud Function para criar no Auth e enviar convite
        const inviteResponse = await fetch(`${CLOUD_FUNCTIONS_BASE}/inviteUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, nome: formData.nome, cargo: formData.cargo })
        });

        const inviteData = await inviteResponse.json();

        if (!inviteResponse.ok) {
            throw new Error(inviteData.error || "Erro ao enviar convite.");
        }

        // 2. Salva no Realtime Database usando o UID do Auth como chave
        // Isso permite que a gente consiga excluir o usuário do Auth depois usando o ID
        await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${inviteData.uid}.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        alert('Usuário convidado com sucesso! Um e-mail foi enviado para definição de senha.');
      }
      fetchEquipe();
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro ao salvar usuário.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      // 1. Exclui do Auth via Backend (Cloud Function)
      await fetch(`${CLOUD_FUNCTIONS_BASE}/deleteUser`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: id })
      });

      // 2. Exclui do Database
      await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${id}.json`, {
        method: 'DELETE'
      });
      setEquipe(prev => prev.filter(u => u.id !== id));
      alert("Usuário excluído.");
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Gerenciamento de Equipe</h2>
      <p className="cotacao-subtitle">Controle de acesso e usuários do sistema administrativo.</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaPlus /> Adicionar Usuário
        </button>
      </div>

      <div className="table-container">
        <table className="historico-tabela">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipe.map(user => (
              <tr key={user.id}>
                <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            {user.nome.charAt(0).toUpperCase()}
                        </div>
                        {user.nome}
                    </div>
                </td>
                <td>{user.email}</td>
                <td>
                    <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '12px', 
                        fontSize: '0.85rem', 
                        background: user.cargo === 'Admin' ? '#e8f5e9' : (user.cargo === 'Vendedor' ? '#e3f2fd' : '#fff3e0'),
                        color: user.cargo === 'Admin' ? '#2e7d32' : (user.cargo === 'Vendedor' ? '#1565c0' : '#ef6c00'),
                        fontWeight: 'bold'
                    }}>
                        {user.cargo}
                    </span>
                </td>
                <td>
                    <span style={{ color: user.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {user.status}
                    </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleOpenModal(user)} title="Editar" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.1rem' }}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(user.id)} title="Excluir" style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {equipe.length === 0 && (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Nenhum usuário encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '500px' }}>
            <button onClick={handleCloseModal} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>{currentUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <h2>{currentUser ? currentUser.nome : 'Adicionar Membro'}</h2>
            </div>

            <form onSubmit={handleSave} className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              <div className="form-group">
                <label><FaIdBadge style={{ marginRight: '5px' }} /> Nome Completo</label>
                <input required name="nome" value={formData.nome} onChange={handleChange} placeholder="Ex: João Silva" />
              </div>
              
              <div className="form-group">
                <label><FaEnvelope style={{ marginRight: '5px' }} /> E-mail</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@lavoro.com" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Cargo</label>
                    <select name="cargo" value={formData.cargo} onChange={handleChange}>
                      <option value="Admin">Admin</option>
                      <option value="Vendedor">Vendedor</option>
                      <option value="Suporte">Suporte</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
              </div>

              <div className="popup-actions" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{currentUser ? 'Salvar Alterações' : 'Enviar Convite'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipe;
