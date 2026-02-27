// src/pages/SolutionsPage.js
// src/pages/SolutionsPage.js
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaWhatsapp, FaHardHat, FaLaptopCode, FaShieldAlt, FaHandHoldingUsd, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from './Button';

// --- Animações ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
`;

// --- Estilos Específicos (Complementares ao App.css) ---
const Section = styled.section`
  padding: 100px 20px;
  background-color: ${props => props.bg || '#fff'};
  display: flex;
  justify-content: center;
  position: relative;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 80px;
  flex-direction: ${props => props.reverse ? 'row-reverse' : 'row'};

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
    gap: 40px;
  }
`;

const TextContent = styled.div`
  flex: 1;
`;

const IconContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const IconCircle = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: ${props => `linear-gradient(135deg, ${props.color}20, ${props.color}40)`};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  animation: ${float} 6s ease-in-out infinite;
`;

const SectionDescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  line-height: 1.8;
  margin-bottom: 30px;
  margin-top: 30px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
  text-align: left;
  display: inline-block;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 1rem;
  color: #555;

  svg {
    color: ${props => props.color};
    flex-shrink: 0;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1s ease-out;
`;

const SolutionsPage = () => {
  const solutions = [
    {
      id: 'construcao',
      title: 'Construção Civil',
      description: 'Transformamos terrenos em marcos de sucesso. Gerenciamos projetos do início ao fim, garantindo qualidade, cumprimento de prazos e orçamentos rigorosos.',
      icon: <FaHardHat />,
      color: '#ff69b4', // Pink
      features: ['Gestão completa de obras', 'Projetos residenciais e comerciais', 'Rigoroso controle de qualidade', 'Inovação em engenharia'],
      reverse: false
    },
    {
      id: 'tecnologia',
      title: 'Tecnologias',
      description: 'Soluções em software sob medida para otimizar a gestão pública e privada. Modernizamos processos para aumentar a eficiência e transparência.',
      icon: <FaLaptopCode />,
      color: '#1e90ff', // Blue
      features: ['Softwares de gestão pública', 'Automação de processos', 'Sistemas personalizados', 'Suporte técnico especializado'],
      reverse: true
    },
    {
      id: 'seguros',
      title: 'Seguros',
      description: 'Consultoria especializada para proteger o que mais importa. Analisamos suas necessidades para garantir a segurança do seu patrimônio e família.',
      icon: <FaShieldAlt />,
      color: '#ffa500', // Orange
      features: ['Seguro de Vida e Saúde', 'Proteção Patrimonial', 'Seguros Empresariais', 'Atendimento personalizado'],
      reverse: false
    },
    {
      id: 'consorcios',
      title: 'Consórcios',
      description: 'O caminho inteligente para suas conquistas. Planeje a compra de imóveis e veículos sem juros, com as melhores taxas de administração.',
      icon: <FaHandHoldingUsd />,
      color: '#3cb371', // Green
      features: ['Planos sem juros', 'Taxas administrativas reduzidas', 'Cartas para imóveis e veículos', 'Planejamento financeiro'],
      reverse: true
    }
  ];

  return (
    <div className="lavoro-app-container">
      <Header />
      
      {/* Reutilizando a classe .hero-section do App.css para manter o layout */}
      <section className="hero-section" style={{ minHeight: '60vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '100px' }}>
        <HeroContent className="content-wrapper">
          <h1 className="hero-title" style={{ fontSize: '3rem', maxWidth: '900px' }}>
            Soluções Integradas para o Seu Futuro
          </h1>
          <p className="hero-subtitle" style={{ textAlign: 'center', maxWidth: '800px' }}>
            No Grupo Lavoro, unimos expertise em construção, tecnologia, proteção e planejamento financeiro para entregar resultados que transformam vidas e negócios.
          </p>
          <Button primary href="#contact" style={{ padding: '15px 40px', fontSize: '1.1rem' }}>
            Fale com um Especialista <FaArrowRight style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
          </Button>
        </HeroContent>
      </section>

      {solutions.map((sol) => (
        <Section key={sol.id} bg={sol.reverse ? '#f8f9fa' : '#fff'}>
          <ContentWrapper reverse={sol.reverse}>
            <TextContent>
              <h2 className="section-title" style={{ textAlign: 'left', color: sol.color }}>{sol.title}</h2>
              <SectionDescription style={{ marginTop: '10px' }}>{sol.description}</SectionDescription>
              <FeatureList>
                {sol.features.map((feat, idx) => (
                  <FeatureItem key={idx} color={sol.color}>
                    <FaCheckCircle /> {feat}
                  </FeatureItem>
                ))}
              </FeatureList>
              <div>
                <Button 
                    href="/contact" 
                    style={{ 
                        backgroundColor: sol.color, 
                        color: '#fff', 
                        border: 'none',
                        boxShadow: `0 4px 15px ${sol.color}60`
                    }}
                >
                    Saiba Mais
                </Button>
              </div>
            </TextContent>
            <IconContainer>
              <IconCircle color={sol.color}>
                {sol.icon}
              </IconCircle>
            </IconContainer>
          </ContentWrapper>
        </Section>
      ))}

      <section className="contact-section" style={{ textAlign: 'center' }}>
        <ContentWrapper style={{ flexDirection: 'column', gap: '20px' }}>
          <h2 className="section-title" style={{ color: '#fff' }}>Pronto para começar?</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Entre em contato hoje mesmo e descubra como o Grupo Lavoro pode ajudar você a alcançar seus objetivos.
          </p>
          <Button 
            href="/contact" 
            style={{ 
                backgroundColor: '#fff', 
                color: '#1e90ff', 
                padding: '15px 40px', 
                fontSize: '1.1rem',
                marginTop: '20px'
            }}
          >
            Solicitar Orçamento
          </Button>
        </ContentWrapper>
      </section>

      <Footer />
      <a href="https://wa.me/5585987864953" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contato via WhatsApp">
          <FaWhatsapp />
      </a>
    </div>
  );
};

export default SolutionsPage;
