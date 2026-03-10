import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

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
  const navigate = useNavigate();
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

  const [clientStatusData, setClientStatusData] = useState({
    labels: [],
    datasets: [{
      label: 'Meus Clientes por Status',
      data: [],
      backgroundColor: [
        'rgba(40, 167, 69, 0.7)',   // Ativo (Verde)
        'rgba(220, 53, 69, 0.7)',   // Inativo (Vermelho)
        'rgba(255, 193, 7, 0.7)',   // Contato (Amarelo)
        'rgba(23, 162, 184, 0.7)',  // Cotação (Azul Claro)
        'rgba(108, 117, 125, 0.7)', // Pendente (Cinza)
      ],
      borderWidth: 1,
    }],
  });

  const [clientesList, setClientesList] = useState([]);

  useEffect(() => {
    const fetchData = async (user) => {
      if (!user) return;

      try {
        const idToken = await user.getIdToken();
        // Busca o cargo do usuário para aplicar filtro
        let userRole = 'Vendedor';
        try {
            const roleResponse = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe/${user.uid}.json?auth=${idToken}`);
            const roleData = await roleResponse.json();
            if (roleData && roleData.cargo) {
                userRole = roleData.cargo;
            }
        } catch (error) {
            console.error("Erro ao buscar cargo do usuário:", error);
        }

        const response = await fetch(`https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json?auth=${idToken}`);
        const data = await response.json();
        
        if (data) {
          const clientesData = data.Clientes || data;
          const filteredClients = [];
          const produtoCounts = {};
          const clientStatusCounts = { 'Ativo': 0, 'Inativo': 0, 'Contato': 0, 'Cotação': 0, 'Pendente': 0 };

          Object.keys(clientesData).forEach(clientId => {
            const cliente = clientesData[clientId];
            
            // Filtra apenas os clientes onde o vendedor é o usuário logado, exceto se for Admin
            if (userRole !== 'Admin' && cliente.VENDEDOR !== user.uid) return;

            // Contagem de Status dos Clientes
            const status = cliente.STATUS || cliente.status;
            if (clientStatusCounts[status] !== undefined) {
                clientStatusCounts[status]++;
            } else if (status) {
                // Caso haja algum status não mapeado
                clientStatusCounts[status] = (clientStatusCounts[status] || 0) + 1;
            }

            // Filtra clientes com status Contato ou Cotação para a lista
            if (status === 'Contato' || status === 'Cotação') {
                filteredClients.push({
                    id: clientId,
                    nome: cliente.USUARIO,
                    telefone: cliente.TELEFONE,
                    email: cliente.EMAIL,
                    status: status,
                    dataCadastro: cliente['ADESÃO'] || '-'
                });
            }

            if (cliente && cliente.cotacoes) {
              const clientCotacoes = Array.isArray(cliente.cotacoes) ? cliente.cotacoes : Object.values(cliente.cotacoes);
              
              clientCotacoes.forEach((cot, index) => {
                const produto = cot.descricao || 'Não especificado';
                produtoCounts[produto] = (produtoCounts[produto] || 0) + 1;
              });
            }
          });

          filteredClients.sort((a, b) => {
            const dateA = a.dataCadastro !== '-' ? new Date(a.dataCadastro.split('/').reverse().join('-')) : new Date(0);
            const dateB = b.dataCadastro !== '-' ? new Date(b.dataCadastro.split('/').reverse().join('-')) : new Date(0);
            return dateB - dateA;
          });
          setClientesList(filteredClients);

          setProdutoData(prev => ({
            ...prev,
            labels: Object.keys(produtoCounts),
            datasets: [{ ...prev.datasets[0], data: Object.values(produtoCounts) }],
          }));

          setClientStatusData(prev => ({
            ...prev,
            labels: Object.keys(clientStatusCounts),
            datasets: [{ ...prev.datasets[0], data: Object.values(clientStatusCounts) }],
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar dados de cotações:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchData(user);
        }
    });
    return () => unsubscribe();
  }, []);


  return (
    <div className="analises-container">
      <div className="dashboard-charts">
        <div className="chart-container">
          <h3>Status dos Meus Clientes</h3>
          <div className="chart-wrapper" style={{ minHeight: '300px' }}>
            <Bar data={clientStatusData} options={{ responsive: true, maintainAspectRatio: false }} />
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
        <h2 className="faturas-section-title">Leads (Contatos e Cotações)</h2>
        <div className="table-container">
          <table className="historico-tabela">
            <thead>
              <tr>
                <th>Nome</th><th>Telefone</th><th>Email</th><th>Data Cadastro</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesList.map(cliente => (
                <tr key={cliente.id}>
                  <td>{cliente.nome}</td>
                  <td>{cliente.telefone}</td>
                  <td>{cliente.email}</td>
                  <td>{cliente.dataCadastro}</td>
                  <td><span className={`status-badge status--${cliente.status.toLowerCase().replace(' ', '-')}`}>{cliente.status}</span></td>
                  <td>
                    <button 
                      onClick={() => navigate('/dashboard-admin/clientes', { state: { openClientId: cliente.id } })} 
                      style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analises;