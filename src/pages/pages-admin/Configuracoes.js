import React, { useState } from 'react';
import { FaPalette, FaUserShield, FaBell, FaQuestionCircle, FaPlus, FaTrash } from 'react-icons/fa';

const Configuracoes = () => {
  // Estado para armazenar as configurações, com valores padrão
  const [settings, setSettings] = useState({
    siteName: 'Lavoro',
    mainColor: '#1e90ff',
    allowRegistrations: true,
    supportEmail: 'suporte@lavoro.com',
    notificationEmail: 'admin@lavoro.com',
  });

  // Estado para o conteúdo da página de Ajuda (FAQ)
  const [faqs, setFaqs] = useState([
    { id: 1, question: 'Como posso emitir a segunda via do meu boleto?', answer: 'Você pode visualizar e baixar todas as suas faturas na seção "Minhas Faturas".' },
    { id: 2, question: 'Como encontro médicos e hospitais da minha rede?', answer: 'A guia de rede credenciada está disponível na seção "Documentação".' },
    { id: 3, question: 'O que é coparticipação?', answer: 'É um valor pago após a utilização de alguns serviços, como consultas e exames.' },
  ]);

  const [isHelpModalOpen, setHelpModalOpen] = useState(false);

  const handleFaqChange = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const addFaqItem = () => {
    setFaqs([...faqs, { id: Date.now(), question: '', answer: '' }]);
  };

  const removeFaqItem = (index) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  // Manipulador para atualizar o estado quando um campo muda
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Manipulador para o envio do formulário
  const handleSave = (e) => {
    e.preventDefault();
    // Em um cenário real, você enviaria os dados para uma API
    console.log('Configurações salvas:', settings);
    alert('Configurações salvas com sucesso!');
  };

  const handleSaveFaqs = () => {
    console.log('FAQs salvos:', faqs);
    alert('Conteúdo da página de Ajuda salvo com sucesso!');
    setHelpModalOpen(false);
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Configurações do Sistema</h2>
      <p className="cotacao-subtitle">Ajuste as configurações gerais, aparência e permissões da plataforma.</p>

      <form onSubmit={handleSave} className="settings-form">
        {/* Seção de Aparência */}
        <fieldset className="settings-fieldset">
          <legend><FaPalette /> Aparência do Site</legend>
          <div className="form-group">
            <label htmlFor="siteName">Nome do Site</label>
            <input type="text" id="siteName" name="siteName" value={settings.siteName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="mainColor">Cor Principal do Tema</label>
            <div className="color-picker-wrapper">
              <input type="color" id="mainColor" name="mainColor" value={settings.mainColor} onChange={handleChange} />
              <span>{settings.mainColor}</span>
            </div>
          </div>
        </fieldset>

        {/* Seção de Acessos e Segurança */}
        <fieldset className="settings-fieldset">
          <legend><FaUserShield /> Acessos e Segurança</legend>
          <div className="form-group-checkbox">
            <input type="checkbox" id="allowRegistrations" name="allowRegistrations" checked={settings.allowRegistrations} onChange={handleChange} />
            <label htmlFor="allowRegistrations">Permitir que novos usuários se cadastrem</label>
          </div>
        </fieldset>

        {/* Seção de Notificações */}
        <fieldset className="settings-fieldset">
          <legend><FaBell /> Notificações</legend>
          <div className="form-group">
            <label htmlFor="notificationEmail">E-mail para Notificações</label>
            <input type="email" id="notificationEmail" name="notificationEmail" value={settings.notificationEmail} onChange={handleChange} />
            <small>Este e-mail receberá alertas sobre novas cotações e novos usuários.</small>
          </div>
        </fieldset>

        {/* Seção de Conteúdo */}
        <fieldset className="settings-fieldset">
          <legend><FaQuestionCircle /> Gerenciar Conteúdo</legend>
          <div className="form-group">
            <label>Página de Ajuda (FAQ)</label>
            <p>Edite as perguntas e respostas que aparecem na seção de ajuda para os clientes.</p>
            <button type="button" className="btn btn-secondary" onClick={() => setHelpModalOpen(true)}>
              Editar Conteúdo da Ajuda
            </button>
          </div>
        </fieldset>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Salvar Alterações
          </button>
        </div>
      </form>

      {isHelpModalOpen && (
        <div className="popup-overlay">
          <div className="popup-content ajuda-editor-popup">
            <button onClick={() => setHelpModalOpen(false)} className="popup-close">&times;</button>
            <h2>Editor da Página de Ajuda (FAQ)</h2>
            
            <div className="faq-editor-list">
              {faqs.map((faq, index) => (
                <div key={faq.id} className="faq-editor-item">
                  <div className="form-group">
                    <label>Pergunta {index + 1}</label>
                    <input type="text" value={faq.question} onChange={(e) => handleFaqChange(index, 'question', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Resposta</label>
                    <textarea rows="3" value={faq.answer} onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}></textarea>
                  </div>
                  <button onClick={() => removeFaqItem(index)} className="btn-remove-faq">
                    <FaTrash /> Remover
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addFaqItem} className="btn-add-faq">
              <FaPlus /> Adicionar Pergunta
            </button>

            <div className="popup-actions">
              <button type="button" onClick={() => setHelpModalOpen(false)} className="btn btn-secondary">Cancelar</button>
              <button type="button" onClick={handleSaveFaqs} className="btn btn-primary">Salvar Conteúdo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;