import React from 'react';
import { FaDownload, FaCreditCard } from 'react-icons/fa';

const Faturas = () => {
  // Dados de exemplo para Plano de Saúde
  const faturasPendentes = [
    { id: 1, descricao: 'Mensalidade Plano de Saúde - Dezembro/2025', valor: 'R$ 450,00', vencimento: '10/12/2025', status: 'Pendente' },
    { id: 2, descricao: 'Coparticipação Consulta Médica - 15/11', valor: 'R$ 35,00', vencimento: '10/12/2025', status: 'Pendente' },
    { id: 3, descricao: 'Mensalidade Plano de Saúde - Janeiro/2026', valor: 'R$ 450,00', vencimento: '10/01/2026', status: 'Pendente' },
  ];

  const historicoFaturas = [
    ...faturasPendentes,
    { id: 4, descricao: 'Mensalidade Plano de Saúde - Novembro/2025', valor: 'R$ 450,00', vencimento: '10/11/2025', status: 'Pago' },
    { id: 5, descricao: 'Mensalidade Plano de Saúde - Outubro/2025', valor: 'R$ 450,00', vencimento: '10/10/2025', status: 'Pago' },
    { id: 6, descricao: 'Mensalidade Plano de Saúde - Setembro/2025', valor: 'R$ 430,00', vencimento: '10/09/2025', status: 'Vencido' },
    { id: 7, descricao: 'Coparticipação Exame Laboratorial - 20/09', valor: 'R$ 55,00', vencimento: '10/10/2025', status: 'Pago' },
  ].sort((a, b) => new Date(b.vencimento.split('/').reverse().join('-')) - new Date(a.vencimento.split('/').reverse().join('-')));

  return (
    <div className="faturas-container">
      {/* Seção 1: Boletos Pendentes */}
      <div className="faturas-section">
        <h2 className="faturas-section-title">Boletos Pendentes</h2>
        <div className="faturas-list">
          {faturasPendentes.map(fatura => (
            <div key={fatura.id} className="fatura-item">
              <div className="fatura-info">
                <p className="fatura-descricao">{fatura.descricao}</p>
                <p className="fatura-vencimento">Vencimento: {fatura.vencimento}</p>
              </div>
              <div className="fatura-valor">
                <p>{fatura.valor}</p>
              </div>
              <div className="fatura-status">
                <span className={`status-badge status--${fatura.status.toLowerCase()}`}>{fatura.status}</span>
              </div>
              <div className="fatura-actions">
                <button className="btn-pagar"><FaCreditCard /> Pagar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção 2: Histórico de Faturas */}
      <div className="faturas-section">
        <h2 className="faturas-section-title">Histórico de Faturas</h2>
        <div className="table-container">
          <table className="historico-tabela">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {historicoFaturas.map(fatura => (
                <tr key={fatura.id}>
                  <td>{fatura.descricao}</td>
                  <td>{fatura.vencimento}</td>
                  <td>{fatura.valor}</td>
                  <td>
                    <span className={`status-badge status--${fatura.status.toLowerCase()}`}>{fatura.status}</span>
                  </td>
                  <td>
                    <button className="btn-download"><FaDownload /></button>
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

export default Faturas;