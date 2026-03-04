import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaSearch, FaSpinner } from 'react-icons/fa';

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [formData, setFormData] = useState({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    municipio: '',
    uf: '',
    cep: '',
    status: 'Ativa'
  });

  const FIREBASE_URL = 'https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/empresas.json';

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await fetch(FIREBASE_URL);
      const data = await response.json();
      if (data) {
        const loadedEmpresas = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setEmpresas(loadedEmpresas);
      } else {
        setEmpresas([]);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    }
  };

  const maskCNPJ = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleOpenModal = (empresa = null) => {
    if (empresa) {
      setCurrentEmpresa(empresa);
      setFormData({
        razaoSocial: empresa.razaoSocial || '',
        nomeFantasia: empresa.nomeFantasia || '',
        cnpj: empresa.cnpj ? maskCNPJ(empresa.cnpj) : '',
        logradouro: empresa.logradouro || '',
        numero: empresa.numero || '',
        complemento: empresa.complemento || '',
        bairro: empresa.bairro || '',
        municipio: empresa.municipio || '',
        uf: empresa.uf || '',
        cep: empresa.cep || '',
        status: empresa.status || 'Ativa'
      });
    } else {
      setCurrentEmpresa(null);
      setFormData({ razaoSocial: '', nomeFantasia: '', cnpj: '', logradouro: '', numero: '', complemento: '', bairro: '', municipio: '', uf: '', cep: '', status: 'Ativa' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setCurrentEmpresa(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'cnpj') {
      finalValue = maskCNPJ(value);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleCnpjLookup = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      alert('Por favor, insira um CNPJ válido com 14 dígitos.');
      return;
    }
    setLoadingCnpj(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          razaoSocial: data.razao_social || '',
          nomeFantasia: data.nome_fantasia || '',
          logradouro: data.logradouro || '',
          numero: data.numero || '',
          complemento: data.complemento || '',
          bairro: data.bairro || '',
          municipio: data.municipio || '',
          uf: data.uf || '',
          cep: data.cep ? String(data.cep).replace(/\D/g, '') : '',
        }));
      } else {
        alert('CNPJ não encontrado ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      alert('Erro ao consultar API de CNPJ.');
    } finally {
      setLoadingCnpj(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData, cnpj: formData.cnpj.replace(/\D/g, '') };

    try {
      let url = FIREBASE_URL;
      let method = 'POST';

      if (currentEmpresa) {
        url = `https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/empresas/${currentEmpresa.id}.json`;
        method = 'PATCH';
      }

      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      alert(currentEmpresa ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!');
      fetchEmpresas();
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      alert("Erro ao salvar empresa.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
      await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/empresas/${id}.json`, {
        method: 'DELETE'
      });
      alert("Empresa excluída com sucesso.");
      fetchEmpresas();
    } catch (error) {
      console.error("Erro ao excluir empresa:", error);
      alert("Erro ao excluir empresa.");
    }
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Gerenciamento de Empresas</h2>
      <p className="cotacao-subtitle">Cadastre as empresas que gerenciam os contratos dos clientes.</p>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FaPlus /> Adicionar Empresa
        </button>
      </div>

      <div className="table-container">
        <table className="historico-tabela">
          <thead>
            <tr>
              <th>Nome Fantasia</th>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {empresas.map(empresa => (
              <tr key={empresa.id}>
                <td>{empresa.nomeFantasia || empresa.razaoSocial}</td>
                <td>{empresa.razaoSocial}</td>
                <td>{maskCNPJ(empresa.cnpj)}</td>
                <td>
                    <span style={{ color: empresa.status === 'Ativa' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {empresa.status}
                    </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleOpenModal(empresa)} title="Editar" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '1.1rem' }}>
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(empresa.id)} title="Excluir" style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '1.1rem' }}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {empresas.length === 0 && (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Nenhuma empresa encontrada.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={handleCloseModal} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>{currentEmpresa ? 'Editar Empresa' : 'Nova Empresa'}</h3>
            </div>

            <form onSubmit={handleSave} className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label><FaBuilding style={{ marginRight: '5px' }} /> CNPJ</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input required name="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" maxLength="18" style={{ flex: 1 }} />
                  <button type="button" onClick={handleCnpjLookup} className="btn btn-secondary" disabled={loadingCnpj}>
                    {loadingCnpj ? <FaSpinner className="icon-spin" /> : <FaSearch />}
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Razão Social</label>
                <input required name="razaoSocial" value={formData.razaoSocial} onChange={handleChange} />
              </div>
              
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Nome Fantasia</label>
                <input name="nomeFantasia" value={formData.nomeFantasia} onChange={handleChange} />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}><hr/></div>

              <div className="form-group">
                <label>CEP</label>
                <input name="cep" value={formData.cep} onChange={handleChange} maxLength="8" />
              </div>
              <div className="form-group">
                <label>Logradouro</label>
                <input name="logradouro" value={formData.logradouro} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Número</label>
                <input name="numero" value={formData.numero} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input name="complemento" value={formData.complemento} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Bairro</label>
                <input name="bairro" value={formData.bairro} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Município</label>
                <input name="municipio" value={formData.municipio} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>UF</label>
                <input name="uf" value={formData.uf} onChange={handleChange} maxLength="2" />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Ativa">Ativa</option>
                  <option value="Inativa">Inativa</option>
                </select>
              </div>

              <div className="popup-actions" style={{ gridColumn: '1 / -1', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{currentEmpresa ? 'Salvar Alterações' : 'Criar Empresa'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empresas;