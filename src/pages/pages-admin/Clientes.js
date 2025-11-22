import React, { useState, useMemo } from 'react';
import { FaEdit, FaFileAlt, FaFileContract, FaFileInvoiceDollar, FaQuoteRight } from 'react-icons/fa';

// --- Dados Mock para a Página ---
const initialClientes = [
  {
    id: 'CLI-01', nome: 'Ana Silva', email: 'ana.silva@example.com', telefone: '(11) 98765-4321', status: 'Ativo', dataCadastro: '15/01/2024',
    documentos: [{ id: 'DOC-A1', nome: 'Comprovante de Residência', status: 'Aprovado' }, { id: 'DOC-A2', nome: 'CNH', status: 'Pendente' }],
    contratos: [{ id: 'CTR-A1', produto: 'Plano de Saúde', status: 'Ativo' }],
    faturas: [{ id: 'FAT-A1', vencimento: '10/12/2025', valor: 'R$ 450,00', status: 'Pendente' }],
    cotacoes: [{ id: 'COT-A1', produto: 'Seguro Auto', data: '20/11/2025', status: 'Concluída' }]
  },
  { id: 'CLI-02', nome: 'Bruno Costa', email: 'bruno.costa@example.com', telefone: '(21) 91234-5678', status: 'Ativo', dataCadastro: '20/02/2024', documentos: [], contratos: [], faturas: [], cotacoes: [] },
  { id: 'CLI-03', nome: 'Carla Dias', email: 'carla.dias@example.com', telefone: '(31) 95555-8888', status: 'Inativo', dataCadastro: '05/03/2025', documentos: [], contratos: [], faturas: [], cotacoes: [] },
  { id: 'CLI-04', nome: 'Daniel Martins', email: 'daniel.m@example.com', telefone: '(41) 94444-7777', status: 'Ativo', dataCadastro: '10/04/2025', documentos: [], contratos: [], faturas: [], cotacoes: [] },
];

const Clientes = () => {
  const [clientes] = useState(initialClientes);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('dados');

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente => {
      const nomeMatch = cliente.nome.toLowerCase().includes(filtroNome.toLowerCase());
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
            <div className="form-group"><label>E-mail</label><input type="email" defaultValue={selectedClient.email} /></div>
            <div className="form-group"><label>Telefone</label><input type="tel" defaultValue={selectedClient.telefone} /></div>
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
                <th>Nome</th><th>E-mail</th><th>Telefone</th><th>Status</th><th>Cliente Desde</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.telefone}</td>
                  <td><span className={`status-badge status--${cliente.status.toLowerCase()}`}>{cliente.status}</span></td>
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