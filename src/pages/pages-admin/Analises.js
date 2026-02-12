import React, { useState, useEffect } from 'react';
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
  const [funilData, setFunilData] = useState({
    labels: ['Enviadas', 'Em Análise', 'Concluídas', 'Rejeitadas'],
    datasets: [{
      label: 'Número de Cotações',
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(30, 144, 255, 0.7)',
        'rgba(23, 162, 184, 0.7)',
        'rgba(40, 167, 69, 0.7)',
        'rgba(220, 53, 69, 0.7)',
      ],
      borderWidth: 1,
    }],
  });

  const [produtoData, setProdutoData] = useState({
    labels: [],
    datasets: [{
      label: 'Cotações por Produto',
      data: [],
      backgroundColor: [
        'rgba(30, 144, 255, 0.8)',
        'rgba(0, 191, 255, 0.8)',
        'rgba(154, 152, 255, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(108, 117, 125, 0.8)',
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
      ],
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  });

  const [cotacoes, setCotacoes] = useState([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedCotacao, setSelectedCotacao] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json');
        const data = await response.json();
        
        if (data) {
          const clientesData = data.Clientes || data;
          const allCotacoes = [];
          const funilCounts = { 'Enviada': 0, 'Em Análise': 0, 'Concluída': 0, 'Rejeitada': 0 };
          const produtoCounts = {};

          Object.keys(clientesData).forEach(clientId => {
            const cliente = clientesData[clientId];
            if (cliente && cliente.cotacoes) {
              const clientCotacoes = Array.isArray(cliente.cotacoes) ? cliente.cotacoes : Object.values(cliente.cotacoes);
              
              clientCotacoes.forEach((cot, index) => {
                allCotacoes.push({
                  ...cot,
                  id: `${clientId}-${index}`,
                  clienteId: clientId,
                  cotacaoIndex: index,
                  cliente: cliente.USUARIO,
                });

                if (funilCounts[cot.status] !== undefined) funilCounts[cot.status]++;
                const produto = cot.descricao || 'Não especificado';
                produtoCounts[produto] = (produtoCounts[produto] || 0) + 1;
              });
            }
          });

          allCotacoes.sort((a, b) => {
            const dateA = a.data ? new Date(a.data.split('/').reverse().join('-')) : new Date(0);
            const dateB = b.data ? new Date(b.data.split('/').reverse().join('-')) : new Date(0);
            return dateB - dateA;
          });
          setCotacoes(allCotacoes);

          setFunilData(prev => ({
            ...prev,
            datasets: [{ ...prev.datasets[0], data: Object.values(funilCounts) }],
          }));

          setProdutoData(prev => ({
            ...prev,
            labels: Object.keys(produtoCounts),
            datasets: [{ ...prev.datasets[0], data: Object.values(produtoCounts) }],
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar dados de cotações:", error);
      }
    };

    fetchData();
  }, []);

  const handleAnalisarClick = (cotacao) => {
    setSelectedCotacao(cotacao);
    setPopupOpen(true);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedCotacao(null);
  };

  const handleEnviarOrcamento = async (e) => {
    e.preventDefault();
    const form = e.target;
    const valorOrcamento = form.elements.valorOrcamento.value;
    const detalhesOrcamento = form.elements.detalhesOrcamento.value;

    if (!selectedCotacao) return;

    const { clienteId, cotacaoIndex } = selectedCotacao;
    const updatedStatus = 'Concluída';

    try {
      await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes/${clienteId}/cotacoes/${cotacaoIndex}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: updatedStatus,
          valor: valorOrcamento,
          respostaOrcamento: detalhesOrcamento
        })
      });

      setCotacoes(cotacoes.map(c => 
        c.id === selectedCotacao.id ? { ...c, status: updatedStatus, valor: valorOrcamento } : c
      ));

      handleClosePopup();
    } catch (error) {
      console.error("Erro ao enviar orçamento:", error);
    }
  };

  return (
    <div className="analises-container">
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Funil de Cotações</h3>
          <div className="chart-wrapper" style={{ minHeight: '300px' }}>
            <Bar data={funilData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="chart-container">
          <h3>Cotações por Produto</h3>
          <div className="chart-wrapper" style={{ minHeight: '300px' }}>
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
              <p><strong>Descrição:</strong> {selectedCotacao.descricao}</p>
              {selectedCotacao.valor && <p><strong>Valor Inicial Sugerido:</strong> {selectedCotacao.valor}</p>}
              {selectedCotacao.mensagem && <p><strong>Mensagem do Cliente:</strong> <em>"{selectedCotacao.mensagem}"</em></p>}
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