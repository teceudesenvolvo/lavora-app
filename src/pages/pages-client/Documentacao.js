import React, { useState } from 'react';
import { FaUpload, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

const Documentacao = () => {
  const [documentos, setDocumentos] = useState([
    { id: 1, nome: 'RG ou CNH (Frente e Verso)', status: 'Pendente', fileName: null },
    { id: 2, nome: 'CPF (se não constar no documento anterior)', status: 'Aprovado', fileName: 'cpf_joao.pdf' },
    { id: 3, nome: 'Comprovante de Endereço', status: 'Pendente', fileName: null },
    { id: 4, nome: 'Certidão de Casamento (se aplicável)', status: 'Rejeitado', motivo: 'Imagem ilegível. Por favor, envie novamente.', fileName: 'certidao_casamento_scan.jpg' },
    { id: 5, nome: 'Certidão de Nascimento (para dependentes)', status: 'Pendente', fileName: null },
  ]);

  const handleFileChange = (e, docId) => {
    const file = e.target.files[0];
    if (!file) return;

    // Simula o envio do arquivo e a atualização do status
    console.log(`Arquivo selecionado para doc ${docId}:`, file.name);

    setDocumentos(docs =>
      docs.map(doc =>
        doc.id === docId ? { ...doc, status: 'Enviado', fileName: file.name, motivo: null } : doc
      )
    );
    // Em uma aplicação real, você faria o upload para um servidor aqui.
    alert(`Documento "${file.name}" enviado para análise.`);
  };

  const getStatusInfo = (status) => {
    switch (status.toLowerCase()) {
      case 'aprovado':
        return { icon: <FaCheckCircle />, className: 'status--pago' }; // Reutilizando classe verde
      case 'pendente':
        return { icon: <FaHourglassHalf />, className: 'status--pendente' }; // Reutilizando classe amarela
      case 'enviado':
        return { icon: <FaUpload />, className: 'status--enviado' }; // Nova classe azul
      case 'rejeitado':
        return { icon: <FaTimesCircle />, className: 'status--vencido' }; // Reutilizando classe vermelha
      default:
        return { icon: null, className: '' };
    }
  };

  return (
    <div className="documentacao-container">
      <h2 className="faturas-section-title">Envio de Documentos</h2>
      <p className="documentacao-subtitle">Para concluir seu cadastro ou atualizar suas informações, por favor, envie os documentos solicitados abaixo.</p>
      <div className="documentos-list">
        {documentos.map(doc => {
          const { icon, className } = getStatusInfo(doc.status);
          return (
            <div key={doc.id} className={`documento-card status-border--${doc.status.toLowerCase()}`}>
              <div className="documento-info">
                <span className="documento-icon">{icon}</span>
                <h3 className="documento-nome">{doc.nome}</h3>
                <span className={`status-badge ${className}`}>{doc.status}</span>
              </div>
              {doc.fileName && <p className="documento-filename">Arquivo: {doc.fileName}</p>}
              {doc.motivo && <p className="documento-motivo">Motivo: {doc.motivo}</p>}
              <label htmlFor={`upload-${doc.id}`} className="btn-upload">
                <FaUpload /> {doc.status === 'Pendente' || doc.status === 'Rejeitado' ? 'Enviar Arquivo' : 'Enviar Novo'}
              </label>
              <input type="file" id={`upload-${doc.id}`} onChange={(e) => handleFileChange(e, doc.id)} style={{ display: 'none' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Documentacao;