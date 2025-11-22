import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaFilePdf } from 'react-icons/fa';

const Relatorios = () => {
  // --- Dados Mock para os Relatórios ---
  const cotacoesData = [
    { id: 'COT-001', cliente: 'Ana Silva', produto: 'Plano de Saúde', status: 'Concluída', valor: 'R$ 450,00' },
    { id: 'COT-002', cliente: 'Bruno Costa', produto: 'Seguro Auto', status: 'Em Análise', valor: '-' },
    { id: 'COT-003', cliente: 'Carla Dias', produto: 'Consórcio', status: 'Concluída', valor: 'R$ 1.500,00' },
    { id: 'COT-004', cliente: 'Daniel Martins', produto: 'Seguro de Vida', status: 'Rejeitada', valor: '-' },
    { id: 'COT-005', cliente: 'Elisa Borges', produto: 'Seguro Viagem', status: 'Enviada', valor: '-' },
  ];

  const clientesData = [
    { id: 'CLI-01', nome: 'Ana Silva', email: 'ana.silva@example.com', telefone: '(11) 98765-4321', desde: '15/01/2024' },
    { id: 'CLI-02', nome: 'Bruno Costa', email: 'bruno.costa@example.com', telefone: '(21) 91234-5678', desde: '20/02/2024' },
    { id: 'CLI-03', nome: 'Carla Dias', email: 'carla.dias@example.com', telefone: '(31) 95555-8888', desde: '05/03/2025' },
    { id: 'CLI-04', nome: 'Daniel Martins', email: 'daniel.m@example.com', telefone: '(41) 94444-7777', desde: '10/04/2025' },
  ];

  // --- Funções de Geração de PDF ---

  const gerarRelatorioCotacoes = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Cliente", "Produto", "Status", "Valor Orçado"];
    const tableRows = [];

    cotacoesData.forEach(item => {
      const itemData = [item.id, item.cliente, item.produto, item.status, item.valor];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [30, 144, 255] }, // Azul do tema
    });

    doc.setFontSize(18);
    doc.text("Relatório de Cotações", 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 25);

    doc.save("relatorio_cotacoes.pdf");
  };

  const gerarRelatorioClientes = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Nome", "E-mail", "Telefone", "Cliente Desde"];
    const tableRows = [];

    clientesData.forEach(item => {
      const itemData = [item.id, item.nome, item.email, item.telefone, item.desde];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [30, 144, 255] },
    });

    doc.setFontSize(18);
    doc.text("Relatório de Clientes Ativos", 14, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 25);

    doc.save("relatorio_clientes.pdf");
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Geração de Relatórios</h2>
      <p className="cotacao-subtitle">Selecione um dos relatórios abaixo para gerar e baixar o arquivo em formato PDF.</p>
      
      <div className="relatorios-list">
        <div className="relatorio-item">
          <h4>Relatório de Cotações por Status</h4>
          <p>Lista todas as cotações solicitadas, incluindo status e valores orçados.</p>
          <button onClick={gerarRelatorioCotacoes} className="btn btn-primary"><FaFilePdf /> Gerar PDF</button>
        </div>
        <div className="relatorio-item">
          <h4>Relatório de Clientes Ativos</h4>
          <p>Exporta uma lista completa de todos os clientes cadastrados na plataforma.</p>
          <button onClick={gerarRelatorioClientes} className="btn btn-primary"><FaFilePdf /> Gerar PDF</button>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;