import React, { useState } from 'react';
import { // ... (imports existentes)
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analises = () => {
  // --- Dados Mock para os Gráficos e Tabela ---

  // 1. Gráfico de Funil de Cotações (Barra)
  const funilData = {
    labels: ['Enviadas', 'Em Análise', 'Concluídas', 'Rejeitadas'],
    datasets: [
      {
        label: 'Número de Cotações',
        data: [120, 85, 60, 25], // Dados de exemplo
        backgroundColor: [
          'rgba(30, 144, 255, 0.7)',
          'rgba(23, 162, 184, 0.7)',
          'rgba(40, 167, 69, 0.7)',
          'rgba(220, 53, 69, 0.7)',
        ],
        borderColor: [
          'rgba(30, 144, 255, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // 2. Gráfico de Cotações por Produto (Pizza)
  const produtoData = {
    labels: ['Plano de Saúde', 'Seguro Auto', 'Seguro de Vida', 'Consórcio', 'Outros'],
    datasets: [
      {
        label: 'Cotações por Produto',
        data: [45, 30, 15, 20, 10], // Dados de exemplo
        backgroundColor: [
          'rgba(30, 144, 255, 0.8)',
          'rgba(0, 191, 255, 0.8)',
          'rgba(154, 152, 255, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(108, 117, 125, 0.8)',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  // 3. Tabela de Cotações Recentes
  const initialCotacoes = [
    { id: 'COT-001', cliente: 'Ana Silva', produto: 'Plano de Saúde', data: '21/11/2025', status: 'Em Análise', detalhes: { vidas: 4, idades: '34, 28, 5, 2' }, mensagem: 'Gostaria de uma opção com boa cobertura para maternidade.' },
    { id: 'COT-002', cliente: 'Bruno Costa', produto: 'Seguro Auto', data: '21/11/2025', status: 'Enviada', detalhes: { modeloVeiculo: 'Honda Civic', anoVeiculo: '2022' }, mensagem: '' },
    { id: 'COT-003', cliente: 'Carla Dias', produto: 'Consórcio', data: '20/11/2025', status: 'Concluída', detalhes: { valorCredito: '150000' }, mensagem: 'Flexibilidade nas parcelas.' },
    { id: 'COT-004', cliente: 'Daniel Martins', produto: 'Seguro de Vida', data: '19/11/2025', status: 'Rejeitada', detalhes: { dataNascimento: '1985-05-10', profissao: 'Engenheiro Civil' }, mensagem: 'Verificar cobertura para esportes radicais.' },
  ];

  const [cotacoes, setCotacoes] = useState(initialCotacoes);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedCotacao, setSelectedCotacao] = useState(null);

  const handleAnalisarClick = (cotacao) => {
    setSelectedCotacao(cotacao);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedCotacao(null);
  };

  const handleEnviarOrcamento = (e) => {
    e.preventDefault();
    alert(`Orçamento para a cotação ${selectedCotacao.id} enviado com sucesso!`);
    
    // Atualiza o status da cotação na lista
    setCotacoes(cotacoes.map(c => 
      c.id === selectedCotacao.id ? { ...c, status: 'Concluída' } : c
    ));

    handleClosePopup();
  };

  return (
    <div className="analises-container">
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Funil de Cotações</h3>
          <div className="chart-wrapper">
            <Bar data={funilData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="chart-container">
          <h3>Cotações por Produto</h3>
          <div className="chart-wrapper">
            <Pie data={produtoData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="faturas-section" style={{ marginTop: '30px' }}>
        <h2 className="faturas-section-title">Cotações Recentes</h2>
        <div className="table-container">
          <table className="historico-tabela">
            <thead>
              <tr>
                <th>ID</th><th>Cliente</th><th>Produto</th><th>Data</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {cotacoes.map(cot => (
                <tr key={cot.id}>
                  <td>{cot.id}</td><td>{cot.cliente}</td><td>{cot.produto}</td><td>{cot.data}</td>
                  <td><span className={`status-badge status--${cot.status.toLowerCase().replace(' ', '-')}`}>{cot.status}</span></td>
                  <td>
                    <button onClick={() => handleAnalisarClick(cot)} className="btn-analisar">
                      Analisar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPopupOpen && selectedCotacao && (
        <div className="popup-overlay">
          <div className="popup-content analise-popup">
            <button onClick={handleClosePopup} className="popup-close">&times;</button>
            <h2>Análise de Cotação - {selectedCotacao.id}</h2>
            
            <div className="cotacao-detalhes-grid">
              <p><strong>Cliente:</strong> {selectedCotacao.cliente}</p>
              <p><strong>Produto:</strong> {selectedCotacao.produto}</p>
              <p><strong>Data:</strong> {selectedCotacao.data}</p>
              <p><strong>Status Atual:</strong> <span className={`status-badge status--${selectedCotacao.status.toLowerCase().replace(' ', '-')}`}>{selectedCotacao.status}</span></p>
            </div>

            <div className="detalhes-especificos">
              <h4>Detalhes da Solicitação</h4>
              <ul>
                {Object.entries(selectedCotacao.detalhes).map(([key, value]) => (
                  <li key={key}><strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}</li>
                ))}
              </ul>
              {selectedCotacao.mensagem && <p><strong>Mensagem:</strong> <em>"{selectedCotacao.mensagem}"</em></p>}
            </div>

            <form className="orcamento-form" onSubmit={handleEnviarOrcamento}>
              <h4>Enviar Orçamento</h4>
              <div className="form-group">
                <label htmlFor="valorOrcamento">Valor do Orçamento (R$)</label>
                <input type="number" id="valorOrcamento" name="valorOrcamento" required />
              </div>
              <div className="form-group">
                <label htmlFor="detalhesOrcamento">Detalhes e Condições</label>
                <textarea id="detalhesOrcamento" name="detalhesOrcamento" rows="4" required></textarea>
              </div>
              <div className="popup-actions">
                <button type="button" onClick={handleClosePopup} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Enviar Orçamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analises;