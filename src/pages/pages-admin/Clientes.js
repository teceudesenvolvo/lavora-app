import React, { useState, useMemo, useEffect } from 'react';
import { FaEdit, FaFileAlt, FaFileContract, FaFileInvoiceDollar, FaQuoteRight } from 'react-icons/fa';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('dados');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-default-rtdb.firebaseio.com/Clientes.json');
        const data = await response.json();
        console.log('Dados recebidos:', response);
        
        if (data) {
          const clientesData = data.Clientes || data;
          const loadedClientes = Object.keys(clientesData).map(key => {
            const item = clientesData[key];
            if (!item) return null;
            return {
              id: key,
              nome: item.USUARIO,
              cpf: item.CPF,
              dataNascimento: item['DATA NASC'],
              mensalidade: item.MENSALIDADE,
              plano: item.PLANO,
              telefone: item.TELEFONE,
              vencimento: item.VENCIMENTO,
              dataCadastro: item['ADESÃO'],
              contratoTipo: item.CONTRATO,
              status: 'Ativo', // Valor padrão
              email: '', // Valor padrão
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
      const statusMatch = filtroStatus === 'Todos' || cliente.status === filtroStatus;
      return nomeMatch && statusMatch;
    });
  }, [clientes, filtroNome, filtroStatus]);

  const handleGerenciarClick = (cliente) => {
    setSelectedClient(cliente);
    setActiveTab('dados'); // Reseta para a primeira aba
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  const renderTabContent = () => {
    if (!selectedClient) return null;

    switch (activeTab) {
      case 'dados':
        return (
          <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group"><label>Nome Completo</label><input type="text" defaultValue={selectedClient.nome} /></div>
            <div className="form-group"><label>CPF</label><input type="text" defaultValue={selectedClient.cpf} /></div>
            <div className="form-group"><label>Data de Nascimento</label><input type="text" defaultValue={selectedClient.dataNascimento} /></div>
            <div className="form-group"><label>Telefone</label><input type="tel" defaultValue={selectedClient.telefone} /></div>
            <div className="form-group"><label>Plano</label><input type="text" defaultValue={selectedClient.plano} /></div>
            <div className="form-group"><label>Mensalidade</label><input type="text" defaultValue={selectedClient.mensalidade} /></div>
            <div className="form-group"><label>Vencimento</label><input type="text" defaultValue={selectedClient.vencimento} /></div>
            <div className="form-group"><label>Status</label>
              <select defaultValue={selectedClient.status}>
                <option value="Ativo">Ativo</option><option value="Inativo">Inativo</option><option value="Pendente">Pendente</option>
              </select>
            </div>
            <div className="popup-actions" style={{ justifyContent: 'flex-start', paddingTop: '10px' }}>
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

  return (
    <>
      <div className="profile-section">
        <h2 className="faturas-section-title">Gerenciamento de Clientes</h2>
        
        <div className="filtros-clientes">
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            className="filtro-input"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          <select 
            className="filtro-select"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>

        <div className="table-container">
          <table className="historico-tabela">
            <thead>
              <tr>
                <th>Usuário</th><th>CPF</th><th>Telefone</th><th>Plano</th><th>Adesão</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.cpf}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.plano}</td>
                  <td>{cliente.dataCadastro}</td>
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
          <div className="popup-content cliente-modal">
            <button onClick={handleCloseModal} className="popup-close">&times;</button>
            <div className="cliente-modal-header">
              <h3>Gerenciando Cliente</h3>
              <h2>{selectedClient.nome}</h2>
            </div>

            <nav className="cliente-modal-tabs">
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
    </>
  );
};

export default Clientes;