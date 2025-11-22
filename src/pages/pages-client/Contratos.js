import React, { useState, useRef } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import SignatureCanvas from 'react-signature-canvas';

const Contratos = () => {
  const [selectedContrato, setSelectedContrato] = useState(null);
  const sigPad = useRef(null);

  // Dados de exemplo para os contratos
  const contratos = [
    {
      id: 1,
      produto: 'Plano de Saúde',
      numero: 'PS-2024-00123',
      dataAssinatura: '15/01/2024',
      status: 'Ativo',
      conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PLANO DE SAÚDE.\n\nPelo presente instrumento particular, de um lado a Lavoro Saúde, e de outro o CONTRATANTE, fica estipulado que o CONTRATANTE pagará à CONTRATADA a mensalidade vigente para a cobertura dos serviços descritos na apólice. Este contrato tem validade de 12 meses, renovando-se automaticamente.`
    },
    {
      id: 2,
      produto: 'Seguro de Vida',
      numero: 'SV-2023-00456',
      dataAssinatura: '20/07/2023',
      status: 'Ativo',
      conteudo: `CONTRATO DE SEGURO DE VIDA.\n\nA seguradora se compromete a pagar o valor de R$ 100.000,00 aos beneficiários em caso de sinistro de morte do titular. O prêmio mensal será debitado automaticamente na conta do CONTRATANTE.`
    },
  ];

  const handleVisualizar = (contrato) => {
    setSelectedContrato(contrato);
  };

  const handleClosePopup = () => {
    setSelectedContrato(null);
  };

  const handleLimpar = () => {
    sigPad.current.clear();
  };

  const handleAssinar = () => {
    if (sigPad.current.isEmpty()) {
      alert("Por favor, forneça sua assinatura.");
      return;
    }
    // Simula o salvamento da assinatura
    // const dataUrl = sigPad.current.getTrimmedCanvas().toDataURL('image/png');
    // console.log(dataUrl);
    alert(`Contrato "${selectedContrato.produto}" assinado digitalmente!`);
    handleClosePopup();
  };

  return (
    <>
      <div className="contratos-container">
        <h2 className="faturas-section-title">Meus Contratos</h2>
        <div className="contratos-list">
          {contratos.map(contrato => (
            <div key={contrato.id} className="contrato-card">
              <div className="contrato-header">
                <h3>{contrato.produto}</h3>
                <span className={`status-badge status--${contrato.status.toLowerCase()}`}>{contrato.status}</span>
              </div>
              <div className="contrato-details">
                <p><strong>Número:</strong> {contrato.numero}</p>
                <p><strong>Data de Assinatura:</strong> {contrato.dataAssinatura}</p>
              </div>
              <div className="contrato-actions">
                <button className="btn-visualizar" onClick={() => handleVisualizar(contrato)}><FaFilePdf /> Visualizar Contrato</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedContrato && (
        <div className="popup-overlay" onClick={handleClosePopup}>
          <div className="popup-content contrato-popup" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={handleClosePopup}>&times;</button>
            <h2 className="popup-title">{selectedContrato.produto}</h2>
            <div className="contrato-texto">
              <pre>{selectedContrato.conteudo}</pre>
            </div>
            <div className="assinatura-container">
              <p>Assine digitalmente abaixo:</p>
              <SignatureCanvas ref={sigPad} penColor='black' canvasProps={{className: 'assinatura-canvas'}} />
            </div>
            <div className="popup-actions">
              <button className="btn-limpar" onClick={handleLimpar}>Limpar</button>
              <button className="btn-assinar" onClick={handleAssinar}>Assinar Digitalmente</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Contratos;