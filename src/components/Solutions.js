import React, { useState } from 'react';
import Button from '../pages/Button';

// Componente do Popup (interno ao Solutions)
const Popup = ({ solution, onClose }) => (
  <div className="popup-overlay" onClick={onClose}>
    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
      <button className="popup-close" onClick={onClose}>&times;</button>
      <h2 className="popup-title">{solution.title}</h2>
      <p className="popup-description">{solution.description}</p>
      <Button primary href="/contact" onClick={onClose}>Fale Conosco</Button>
    </div>
  </div>
);

const Solutions = () => {
  const [selectedSolution, setSelectedSolution] = useState(null);

  const solutionsData = [
    { 
      title: 'Construção Civil', 
      subtitle: 'Projetos que inspiram e edificam o futuro.', 
      color: '#ff69b4',
      description: 'Na Lavoro, transformamos terrenos em marcos de sucesso. Com uma equipe de especialistas e foco em inovação, gerenciamos projetos de construção civil do início ao fim, garantindo qualidade, cumprimento de prazos e orçamentos rigorosos. Desde residenciais a grandes complexos comerciais, edificamos o futuro.'
    },
    { 
      title: 'Tecnologias', 
      subtitle: 'Soluções em software para a gestão pública.', 
      color: '#1e90ff',
      description: 'A Lavoro desenvolve sistemas e softwares sob medida para otimizar a gestão pública. Nossas soluções tecnológicas modernizam processos, aumentam a eficiência, promovem a transparência e melhoram o atendimento ao cidadão, capacitando municípios e órgãos governamentais para os desafios do futuro.'
    },
    { 
      title: 'Seguros', 
      subtitle: 'Sua tranquilidade e patrimônio protegidos.', 
      color: '#ffa500',
      description: 'Com a Lavoro, oferecemos consultoria especializada para encontrar os melhores seguros para você, sua família ou sua empresa. Analisamos suas necessidades para garantir a proteção do seu patrimônio e a segurança do seu futuro, com apólices de vida, saúde, automóvel, residencial e empresarial.'
    },
    { 
      title: 'Consórcios', 
      subtitle: 'O caminho inteligente para suas conquistas.', 
      color: '#3cb371',
      description: 'Planeje suas grandes conquistas sem juros com os consórcios do Grupo Lavoro. Seja para adquirir um imóvel, um veículo ou contratar serviços, oferecemos planos flexíveis e as melhores taxas de administração do mercado. Uma forma inteligente e segura de realizar seus sonhos.'
    },
  ];

  return (
    <section id="solutions" className="solutions-section">
      <div className="solutions-header">
        <h2 className="section-title">O Que Fazemos</h2>
        <p className="section-subtitle">
          Conectamos sua necessidade com a solução ideal. Somos especialistas em construir, inovar e proteger.
        </p>
      </div>
      <div className="cards-container">
        {solutionsData.map((sol, index) => (
          <div key={index} className="solution-card" style={{ backgroundColor: sol.color }} onClick={() => setSelectedSolution(sol)}>
            <h3 className="card-title">{sol.title}</h3>
            <p className="card-subtitle">{sol.subtitle}</p>
          </div>
        ))}
      </div>
      {selectedSolution && <Popup solution={selectedSolution} onClose={() => setSelectedSolution(null)} />}
    </section>
  );
};

export default Solutions;