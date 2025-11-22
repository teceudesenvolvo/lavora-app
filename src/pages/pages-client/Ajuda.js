import React from 'react';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Ajuda = () => {
  const faqs = [
    {
      question: 'Como posso emitir a segunda via do meu boleto?',
      answer: 'Você pode visualizar e baixar todas as suas faturas na seção "Minhas Faturas". As faturas pendentes aparecerão no topo da lista com um botão para pagamento ou download.'
    },
    {
      question: 'Como encontro médicos e hospitais da minha rede?',
      answer: 'A guia de rede credenciada está disponível na seção "Documentação". Lá você encontrará um arquivo PDF atualizado com todos os profissionais e estabelecimentos cobertos pelo seu plano.'
    },
    {
      question: 'O que é coparticipação?',
      answer: 'Coparticipação é um valor que você paga após a utilização de alguns serviços, como consultas e exames. Esse valor é adicionado à sua fatura mensal. Você pode ver a distribuição dos seus gastos no gráfico da "Visão Geral".'
    },
    {
      question: 'Como solicito o reembolso de uma consulta?',
      answer: 'Para solicitar um reembolso, entre em contato diretamente com nosso suporte via WhatsApp ou e-mail, informando os detalhes da consulta e anexando o recibo ou nota fiscal.'
    }
  ];

  return (
    <div className="ajuda-container">
      {/* Seção de Perguntas Frequentes (FAQ) */}
      <div className="faq-container">
        <h2 className="faturas-section-title">Perguntas Frequentes (FAQ)</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details key={index} className="faq-item">
              <summary className="faq-question">{faq.question}</summary>
              <p className="faq-answer">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Seção de Contato */}
      <div className="ajuda-contato-container">
        <h2 className="faturas-section-title">Ainda precisa de ajuda?</h2>
        <p className="cotacao-subtitle">Nossa equipe está pronta para te atender.</p>
        <div className="contato-cards">
          <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="contato-card">
            <FaWhatsapp className="contato-icon" />
            <h3>WhatsApp</h3>
            <p>Converse conosco em tempo real.</p>
          </a>
          <a href="mailto:suporte@lavoro.com" className="contato-card">
            <FaEnvelope className="contato-icon" />
            <h3>E-mail</h3>
            <p>Envie sua dúvida para nosso suporte.</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Ajuda;