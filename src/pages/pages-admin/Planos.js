import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaDollarSign, FaClipboardList, FaBed, FaBaby, FaUserFriends } from 'react-icons/fa';

const Planos = () => {
  const [planos, setPlanos] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPlano, setCurrentPlano] = useState(null);
  const [formData, setFormData] = useState({
    Plano: '',
    Acomodação: 'Apartamento',
    Obstetrícia: 'Não',
    '00-18 anos': '',
    '19-23 anos': '',
    '24-28 anos': '',
    '29-33 anos': '',
    '34-38 anos': '',
    '39-43 anos': '',
    '44-48 anos': '',
    '49-53 anos': '',
    '54-58 anos': '',
    '59+ anos': '',
    status: 'Ativo'
  });

  const FIREBASE_URL = 'https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/planos.json';

  useEffect(() => {
    fetchPlanos();
  }, []);

  const fetchPlanos = async () => {
    try {
      const response = await fetch(FIREBASE_URL);
      const data = await response.json();
      if (data) {
        const loadedPlanos = Object.keys(data).map(key => {
            const item = data[key];
            if (!item) return null;
            return { id: key, ...item };
        }).filter(item => item !== null);
        setPlanos(loadedPlanos);
      } else {
        setPlanos([]);
      }
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
    }
  };

  const maskCurrency = (value) => {
    const v = String(value).replace(/\D/g, "");
    if (!v) return "";
    const numberValue = (Number(v) / 100).toFixed(2);
    return "R$ " + numberValue.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };

  const removeCurrencyMask = (value) => {
    if (!value) return "0.00";
    const v = String(value).replace(/\D/g, "");
    if (!v) return "0.00";
    return (Number(v) / 100).toFixed(2);
  };

  const handleOpenModal = (plano = null) => {
    if (plano) {
      setCurrentPlano(plano);
      setFormData({ 
        Plano: plano.Plano || '',
        Acomodação: plano.Acomodação || 'Apartamento',
        Obstetrícia: plano.Obstetrícia || 'Não',
        '00-18 anos': maskCurrency(plano['00-18 anos'] || ''),
        '19-23 anos': maskCurrency(plano['19-23 anos'] || ''),
        '24-28 anos': maskCurrency(plano['24-28 anos'] || ''),
        '29-33 anos': maskCurrency(plano['29-33 anos'] || ''),
        '34-38 anos': maskCurrency(plano['34-38 anos'] || ''),
        '39-43 anos': maskCurrency(plano['39-43 anos'] || ''),
        '44-48 anos': maskCurrency(plano['44-48 anos'] || ''),
        '49-53 anos': maskCurrency(plano['49-53 anos'] || ''),
        '54-58 anos': maskCurrency(plano['54-58 anos'] || ''),
        '59+ anos': maskCurrency(plano['59+ anos'] || ''),
        status: plano.status || 'Ativo'
      });
    } else {
      setCurrentPlano(null);
      // Reset form to initial state
      setFormData({ Plano: '', Acomodação: 'Apartamento', Obstetrícia: 'Não', '00-18 anos': '', '19-23 anos': '', '24-28 anos': '', '29-33 anos': '', '34-38 anos': '', '39-43 anos': '', '44-48 anos': '', '49-53 anos': '', '54-58 anos': '', '59+ anos': '', status: 'Ativo' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentPlano(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: maskCurrency(value) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    const payload = {
      Plano: formData.Plano,
      Acomodação: formData.Acomodação,
      Obstetrícia: formData.Obstetrícia,
      '00-18 anos': removeCurrencyMask(formData['00-18 anos']),
      '19-23 anos': removeCurrencyMask(formData['19-23 anos']),
      '24-28 anos': removeCurrencyMask(formData['24-28 anos']),
      '29-33 anos': removeCurrencyMask(formData['29-33 anos']),
      '34-38 anos': removeCurrencyMask(formData['34-38 anos']),
      '39-43 anos': removeCurrencyMask(formData['39-43 anos']),
      '44-48 anos': removeCurrencyMask(formData['44-48 anos']),
      '49-53 anos': removeCurrencyMask(formData['49-53 anos']),
      '54-58 anos': removeCurrencyMask(formData['54-58 anos']),
      '59+ anos': removeCurrencyMask(formData['59+ anos']),
      status: formData.status
    };

    try {
      let url = FIREBASE_URL;
      let method = 'POST';

      if (currentPlano) {
        url = `https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/planos/${currentPlano.id}.json`;
        method = 'PATCH';
      }

      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      alert(currentPlano ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!');
      fetchPlanos();
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar plano:", error);
      alert("Erro ao salvar plano.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este plano?")) return;

    try {
      await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/planos/${id}.json`, {
        method: 'DELETE'
      });
      alert("Plano excluído com sucesso.");
      fetchPlanos();
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      alert("Erro ao excluir plano.");
    }
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Gerenciamento de Planos</h2>
      <p className="cotacao-subtitle">Crie e gerencie os planos oferecidos aos clientes.</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaPlus /> Adicionar Plano
        </button>
      </div>

      <div className="table-container">
        <table className="historico-tabela">
          <thead>
            <tr>
              <th>Plano</th>
              <th>Acomodação</th>
              <th>Obstetrícia</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {planos.map(plano => (
              <tr key={plano.id}>
                <td>{plano.Plano}</td>
                <td>{plano.Acomodação}</td>
                <td>{plano.Obstetrícia}</td>
                <td>
                    <span style={{ color: plano.status === 'Ativo' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {plano.status || 'Ativo'}
                    </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleOpenModal(plano)} title="Editar" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.1rem' }}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(plano.id)} title="Excluir" style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {planos.length === 0 && (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Nenhum plano encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={handleCloseModal} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>{currentPlano ? 'Editar Plano' : 'Novo Plano'}</h3>
              <h2>{currentPlano ? currentPlano.Plano : 'Adicionar Plano'}</h2>
            </div>

            <form onSubmit={handleSave} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label><FaClipboardList style={{ marginRight: '5px' }} /> Nome do Plano</label>
                <input required name="Plano" value={formData.Plano} onChange={handleChange} placeholder="Ex: Plano Saúde Essencial" />
              </div>
              
              <div className="form-group">
                <label><FaBed style={{ marginRight: '5px' }} /> Acomodação</label>
                <select name="Acomodação" value={formData.Acomodação} onChange={handleChange}>
                  <option value="Apartamento">Apartamento</option>
                  <option value="Enfermaria">Enfermaria</option>
                </select>
              </div>

              <div className="form-group">
                <label><FaBaby style={{ marginRight: '5px' }} /> Obstetrícia</label>
                <select name="Obstetrícia" value={formData.Obstetrícia} onChange={handleChange}>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUserFriends /> Tabela de Preços por Faixa Etária</label>
              </div>

              {Object.keys(formData).filter(k => k.includes('anos') || k.includes('+')).map(key => (
                <div className="form-group" key={key}>
                  <label><FaDollarSign style={{ marginRight: '5px' }} /> {key}</label>
                  <input 
                    name={key} 
                    value={formData[key]} 
                    onChange={handlePriceChange} 
                    placeholder="R$ 0,00" 
                  />
                </div>
              ))}

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="popup-actions" style={{ gridColumn: '1 / -1', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{currentPlano ? 'Salvar Alterações' : 'Criar Plano'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Planos;