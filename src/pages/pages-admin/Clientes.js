import React, { useState, useMemo, useEffect } from 'react';
import { FaEdit, FaFileAlt, FaFileContract, FaFileInvoiceDollar, FaQuoteRight, FaList, FaExclamationCircle, FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('dados');
  const [listTab, setListTab] = useState('ativos');

  // Estados para o Modal de Adicionar Cliente
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState('dados');
  const [newClientData, setNewClientData] = useState({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '', plano: '', tipo: '', valor: '', vendedor: '' });
  const [newClientDocs, setNewClientDocs] = useState({ rgCnh: '', comprovanteEndereco: '' });
  const [planItems, setPlanItems] = useState([]);
  const [tempPlanItem, setTempPlanItem] = useState({ descricao: '', valor: '' });

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-default-rtdb.firebaseio.com/clientes.json');
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        if (data) {
          const clientesData = data.Clientes || data;
          const loadedClientes = Object.keys(clientesData).map(key => {
            const item = clientesData[key];
            if (!item) return null;

            // Função auxiliar para formatar datas
            const normalizeDate = (dateStr) => {
                if (!dateStr) return '-';
                const parts = dateStr.split('/');
                if (parts.length !== 3) return dateStr;
                let day = parseInt(parts[0], 10);
                let month = parseInt(parts[1], 10);
                let year = parseInt(parts[2], 10);
                // Detecta formato M/D/Y (comum em alguns bancos) e inverte para D/M/Y
                if (month > 12) { const temp = day; day = month; month = temp; }
                return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            };

            return {
              id: key,
              nome: item.USUARIO,
              cpf: item.CPF,
              dataNascimento: normalizeDate(item['DATA NASC']),
              mensalidade: item.MENSALIDADE,
              plano: item.PLANO,
              telefone: item.TELEFONE,
              vencimento: normalizeDate(item.VENCIMENTO),
              dataCadastro: normalizeDate(item['ADESÃO']),
              contratoTipo: item.CONTRATO,
              status: item.STATUS || 'Ativo', // Valor padrão
              email: item.EMAIL || '', // Valor padrão
              documentos: item.documentos || [],
              contratos: item.contratos || [],
              faturas: item.faturas || [],
              cotacoes: item.cotacoes || []
            };
          }).filter(item => item !== null);
          setClientes(loadedClientes);
        }
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
      }
    };

    fetchClientes();
  }, []);

  const clientesFiltrados = useMemo(() => {

    return clientes.filter(cliente => {
      const nome = cliente.nome || '';
      const nomeMatch = nome.toLowerCase().includes(filtroNome.toLowerCase());
      
      let tabMatch = true;
      if (listTab === 'ativos') {
        tabMatch = cliente.status === 'Ativo';
      } else if (listTab === 'inativos') {
        tabMatch = cliente.status === 'Inativo';
      } else if (listTab === 'contatos') {
        tabMatch = cliente.status === 'Contato' || cliente.status === 'Pendente';
      } else if (listTab === 'cotacoes') {
        tabMatch = cliente.status === 'Cotação';
      }

      return nomeMatch && tabMatch;
    }).sort((a, b) => {
      return (a.nome || '').localeCompare(b.nome || '');
    });
  }, [clientes, filtroNome, listTab]);

  const handleGerenciarClick = (cliente) => {
    setSelectedClient(cliente);
    setActiveTab('dados'); // Reseta para a primeira aba
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  // --- Funções de Máscara ---
  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskDate = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  };

  const maskCurrency = (value) => {
    const v = value.replace(/\D/g, "");
    if (!v) return "";
    const numberValue = (Number(v) / 100).toFixed(2);
    return "R$ " + numberValue.replace(".", ",").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  };

  const removeCurrencyMask = (value) => {
    if (!value) return "";
    const v = value.replace(/\D/g, "");
    if (!v) return "";
    return (Number(v) / 100).toFixed(2);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setNewClientDocs(prev => ({ ...prev, [fieldName]: base64 }));
      } catch (error) {
        console.error("Erro ao converter arquivo:", error);
      }
    }
  };

  const handleNextStep = () => {
    if (addModalTab === 'dados') setAddModalTab('documentacao');
    else if (addModalTab === 'documentacao') setAddModalTab('plano');
  };

  const handlePrevStep = () => {
    if (addModalTab === 'plano') setAddModalTab('documentacao');
    else if (addModalTab === 'documentacao') setAddModalTab('dados');
  };

  // --- Funções para Adicionar Cliente ---
  const handleAddClientClick = () => {
    setNewClientData({ nome: '', cpf: '', dataNascimento: '', telefone: '', email: '', plano: '', tipo: '', valor: '', vendedor: '' });
    setNewClientDocs({ rgCnh: '', comprovanteEndereco: '' });
    setPlanItems([]);
    setAddModalTab('dados');
    setAddModalOpen(true);
  };

  const handleNewClientChange = (e) => {
    const { name, value } = e.target;
    setNewClientData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPlanItem = () => {
    if (tempPlanItem.descricao && tempPlanItem.valor) {
      setPlanItems([...planItems, { ...tempPlanItem, id: Date.now() }]);
      setTempPlanItem({ descricao: '', valor: '' });
    }
  };

  const handleRemovePlanItem = (id) => {
    setPlanItems(planItems.filter(item => item.id !== id));
  };

  const saveNewClient = async () => {
    const clientPayload = {
      USUARIO: newClientData.nome,
      CPF: newClientData.cpf,
      'DATA NASC': newClientData.dataNascimento,
      TELEFONE: newClientData.telefone,
      EMAIL: newClientData.email,
      PLANO: newClientData.plano,
      CONTRATO: newClientData.tipo,
      MENSALIDADE: removeCurrencyMask(newClientData.valor),
      VENDEDOR: newClientData.vendedor,
      STATUS: 'Ativo',
      'ADESÃO': new Date().toLocaleDateString('pt-BR'),
      itensPlano: planItems.map(item => ({ ...item, valor: removeCurrencyMask(item.valor) })),
      documentos: newClientDocs
    };

    try {
      const response = await fetch('https://lavoro-servicos-default-rtdb.firebaseio.com/clientes.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientPayload)
      });

      if (response.ok) {
        const { name } = await response.json();
        const newClientLocal = {
          id: name,
          nome: clientPayload.USUARIO,
          cpf: clientPayload.CPF,
          dataNascimento: clientPayload['DATA NASC'],
          mensalidade: clientPayload.MENSALIDADE,
          plano: clientPayload.PLANO,
          telefone: clientPayload.TELEFONE,
          status: clientPayload.STATUS,
          vencimento: '-'
        };
        setClientes(prev => [...prev, newClientLocal]);
        alert('Cliente adicionado com sucesso!');
        setAddModalOpen(false);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente", error);
      alert("Erro ao salvar cliente");
    }
  };

  const handleSaveClient = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const updatedData = {
      USUARIO: formData.get('nome'),
      CPF: formData.get('cpf'),
      'DATA NASC': formData.get('dataNascimento'),
      TELEFONE: formData.get('telefone'),
      PLANO: formData.get('plano'),
      MENSALIDADE: removeCurrencyMask(formData.get('mensalidade')),
      VENCIMENTO: formData.get('vencimento'),
      EMAIL: formData.get('email'),
      STATUS: formData.get('status')
    };

    try {
      const response = await fetch(`https://lavoro-servicos-default-rtdb.firebaseio.com/clientes/${selectedClient.id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        setClientes(prev => prev.map(c => c.id === selectedClient.id ? {
          ...c,
          nome: updatedData.USUARIO,
          cpf: updatedData.CPF,
          dataNascimento: updatedData['DATA NASC'],
          telefone: updatedData.TELEFONE,
          plano: updatedData.PLANO,
          mensalidade: updatedData.MENSALIDADE,
          vencimento: updatedData.VENCIMENTO,
          email: updatedData.EMAIL,
          status: updatedData.STATUS
        } : c));
        alert('Cliente atualizado com sucesso!');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao salvar alterações.');
    }
  };

  const renderTabContent = () => {
    if (!selectedClient) return null;

    switch (activeTab) {
      case 'dados':
        return (
          <form className="profile-form" onSubmit={handleSaveClient} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Nome Completo</label><input type="text" name="nome" defaultValue={selectedClient.nome} style={{ width: '100%' }} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>E-mail</label><input type="email" name="email" defaultValue={selectedClient.email} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>CPF</label><input type="text" name="cpf" defaultValue={selectedClient.cpf} onChange={(e) => e.target.value = maskCPF(e.target.value)} maxLength="14" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Data de Nascimento</label><input type="text" name="dataNascimento" defaultValue={selectedClient.dataNascimento} onChange={(e) => e.target.value = maskDate(e.target.value)} maxLength="10" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Telefone</label><input type="tel" name="telefone" defaultValue={selectedClient.telefone} onChange={(e) => e.target.value = maskPhone(e.target.value)} maxLength="15" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Plano</label><input type="text" name="plano" defaultValue={selectedClient.plano} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Mensalidade</label><input type="text" name="mensalidade" defaultValue={selectedClient.mensalidade} onChange={(e) => e.target.value = maskCurrency(e.target.value)} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Vencimento</label><input type="text" name="vencimento" defaultValue={selectedClient.vencimento} onChange={(e) => e.target.value = maskDate(e.target.value)} maxLength="10" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Status</label>
              <select name="status" defaultValue={selectedClient.status} style={{ width: '100%' }}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Contato">Contato</option>
                <option value="Cotação">Cotação</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>
            <div className="popup-actions" style={{ gridColumn: '1 / -1', justifyContent: 'flex-start', paddingTop: '10px' }}>
              <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            </div>
          </form>
        );
      case 'documentos':
        return <p>Visualização de documentos do cliente {selectedClient.nome}.</p>;
      case 'contratos':
        return <p>Visualização de contratos do cliente {selectedClient.nome}.</p>;
      case 'faturas':
        return <p>Visualização de faturas do cliente {selectedClient.nome}.</p>;
      case 'cotacoes':
        return <p>Visualização de cotações do cliente {selectedClient.nome}.</p>;
      default:
        return null;
    }
  };

  const renderAddModalContent = () => {
    switch(addModalTab) {
      case 'dados':
        return (
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label>Cliente</label><input name="nome" value={newClientData.nome} onChange={handleNewClientChange} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>CPF</label><input name="cpf" value={newClientData.cpf} onChange={(e) => { e.target.value = maskCPF(e.target.value); handleNewClientChange(e); }} maxLength="14" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Data de Nascimento</label><input name="dataNascimento" value={newClientData.dataNascimento} onChange={(e) => { e.target.value = maskDate(e.target.value); handleNewClientChange(e); }} maxLength="10" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Telefone</label><input name="telefone" value={newClientData.telefone} onChange={(e) => { e.target.value = maskPhone(e.target.value); handleNewClientChange(e); }} maxLength="15" style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Email</label><input name="email" value={newClientData.email} onChange={handleNewClientChange} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Titular?</label><input name="tipo" value={newClientData.tipo} onChange={handleNewClientChange} style={{ width: '100%' }} /></div>
            <div className="form-group"><label>Vendedor</label><input name="vendedor" value={newClientData.vendedor} onChange={handleNewClientChange} style={{ width: '100%' }} /></div>
          </div>
        );
      case 'documentacao':
        return (
          <div className="form-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group"><label>RG ou CNH</label><input type="file" onChange={(e) => handleFileChange(e, 'rgCnh')} /></div>
            <div className="form-group"><label>Comprovante de Endereço</label><input type="file" onChange={(e) => handleFileChange(e, 'comprovanteEndereco')} /></div>
          </div>
        );
      case 'plano':
        return (
          <div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}><label>Descrição</label><input value={tempPlanItem.descricao} onChange={(e) => setTempPlanItem({...tempPlanItem, descricao: e.target.value})} style={{ width: '100%' }} /></div>
              <div className="form-group" style={{ width: '150px' }}><label>Valor</label><input value={tempPlanItem.valor} onChange={(e) => setTempPlanItem({...tempPlanItem, valor: maskCurrency(e.target.value)})} style={{ width: '100%' }} /></div>
              <button type="button" className="btn btn-primary" onClick={handleAddPlanItem} style={{ marginBottom: '2px', height: '38px' }}><FaPlus /> Adicionar</button>
            </div>
            <table className="historico-tabela">
              <thead><tr><th>Descrição</th><th>Valor</th><th>Ação</th></tr></thead>
              <tbody>
                {planItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.descricao}</td>
                    <td>{item.valor}</td>
                    <td><button onClick={() => handleRemovePlanItem(item.id)} className="btn-remove-faq" style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}><FaTrash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <div className="profile-section">
        <h2 className="faturas-section-title">Gerenciamento de Clientes</h2>
        
        <div className="tabs-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button className={`btn-tab ${listTab === 'ativos' ? 'active' : ''}`} onClick={() => setListTab('ativos')}><FaCheckCircle /> Ativos</button>
          <button className={`btn-tab ${listTab === 'inativos' ? 'active' : ''}`} onClick={() => setListTab('inativos')}><FaExclamationCircle /> Inativos</button>
          <button className={`btn-tab ${listTab === 'contatos' ? 'active' : ''}`} onClick={() => setListTab('contatos')}><FaList /> Contatos</button>
          <button className={`btn-tab ${listTab === 'cotacoes' ? 'active' : ''}`} onClick={() => setListTab('cotacoes')}><FaQuoteRight /> Cotações</button>
        </div>

        <div className="filtros-clientes" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="filtro-input"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleAddClientClick} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaPlus /> Adicionar Cliente
          </button>
        </div>

        <div className="table-container">
          <table className="historico-tabela">
            <thead>
              <tr>
                <th>Usuário</th><th>CPF</th><th>Telefone</th><th>Mensalidade</th><th>Vencimento</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                  <td>{cliente.telefone}</td>
                  <td>R$ {cliente.mensalidade}</td>
                  <td>{cliente.vencimento}</td>
                  <td>
                    <button onClick={() => handleGerenciarClick(cliente)} className="btn-gerenciar">
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedClient && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={handleCloseModal} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Gerenciando Cliente</h3>
              <h2>{selectedClient.nome}</h2>
            </div>

            <nav className="cliente-modal-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={() => setActiveTab('dados')} className={activeTab === 'dados' ? 'active' : ''}><FaEdit /> Dados Pessoais</button>
              <button onClick={() => setActiveTab('documentos')} className={activeTab === 'documentos' ? 'active' : ''}><FaFileAlt /> Documentação</button>
              <button onClick={() => setActiveTab('contratos')} className={activeTab === 'contratos' ? 'active' : ''}><FaFileContract /> Contratos</button>
              <button onClick={() => setActiveTab('faturas')} className={activeTab === 'faturas' ? 'active' : ''}><FaFileInvoiceDollar /> Faturas</button>
              <button onClick={() => setActiveTab('cotacoes')} className={activeTab === 'cotacoes' ? 'active' : ''}><FaQuoteRight /> Cotações</button>
            </nav>

            <div className="cliente-modal-content">
              {renderTabContent()}
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content cliente-modal" style={{ width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setAddModalOpen(false)} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Novo Cadastro</h3>
              <h2>Adicionar Cliente</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div style={{ color: addModalTab === 'dados' ? '#007bff' : '#ccc', fontWeight: addModalTab === 'dados' ? 'bold' : 'normal' }}>1. Dados Cadastrais</div>
                <div style={{ color: '#ccc' }}>&gt;</div>
                <div style={{ color: addModalTab === 'documentacao' ? '#007bff' : '#ccc', fontWeight: addModalTab === 'documentacao' ? 'bold' : 'normal' }}>2. Documentação</div>
                <div style={{ color: '#ccc' }}>&gt;</div>
                <div style={{ color: addModalTab === 'plano' ? '#007bff' : '#ccc', fontWeight: addModalTab === 'plano' ? 'bold' : 'normal' }}>3. Plano</div>
            </div>

            <div className="cliente-modal-content" style={{ marginTop: '20px' }}>
              {renderAddModalContent()}
            </div>
            <div className="popup-actions" style={{ marginTop: '20px', justifyContent: 'space-between' }}>
              {addModalTab === 'dados' ? 
                <button onClick={() => setAddModalOpen(false)} className="btn btn-secondary">Cancelar</button> :
                <button onClick={handlePrevStep} className="btn btn-secondary">Voltar</button>
              }
              {addModalTab === 'plano' ? 
                <button onClick={saveNewClient} className="btn btn-primary">Salvar Cliente</button> :
                <button onClick={handleNextStep} className="btn btn-primary">Próximo</button>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Clientes;