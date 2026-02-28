// src/pages/AboutPage.js
// src/pages/AboutPage.js
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaWhatsapp, FaHandshake, FaLightbulb, FaShieldAlt, FaUsers, FaArrowRight } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from './Button';
import ImageSectionAbout from '../assets/images/visao2.jpg';

// --- Animações ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Estilos Específicos ---
const Section = styled.section`
  padding: 100px 20px;
  background-color: ${props => props.bg || '#fff'};
  display: flex;
  justify-content: center;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 60px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  align-items: center;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const TextColumn = styled.div`
  animation: ${fadeIn} 1s ease-out;
`;

const ImageColumn = styled.div`
  animation: ${fadeIn} 1.2s ease-out;
  img {
    width: 100%;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    object-fit: cover;
    height: 100%;
    max-height: 500px;
  }
`;

const ValueCard = styled.div`
  background: white;
  padding: 40px 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-top: 4px solid transparent;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    border-top-color: #1e90ff;
  }

  svg {
    font-size: 3rem;
    color: #1e90ff;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 1.4rem;
    margin-bottom: 15px;
    color: #333;
    font-weight: 700;
  }

  p {
    color: #666;
    line-height: 1.6;
    font-size: 1rem;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 1s ease-out;
`;

const AboutPage = () => {
  return (
    <div className="lavoro-app-container">
      <Header />

      {/* Hero Section - Reutilizando estilos globais */}
      <section className="hero-section" style={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center', paddingTop: '100px' }}>
        <HeroContent className="content-wrapper">
          <h1 className="hero-title" style={{ fontSize: '3rem', maxWidth: '900px' }}>
            Quem Somos
          </h1>
          <p className="hero-subtitle" style={{ textAlign: 'center', maxWidth: '800px' }}>
            Construindo histórias, inovando processos e protegendo o que é mais valioso para você. Conheça a essência do Grupo Lavoro.
          </p>
        </HeroContent>
      </section>

      {/* Nossa História */}
      <Section>
        <GridContainer>
          <ImageColumn>
            <img src={ImageSectionAbout} alt="Nossa Visão" />
          </ImageColumn>
          <TextColumn>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '30px', color: '#1e90ff' }}>Nossa História</h2>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginBottom: '20px' }}>
              O Grupo Lavoro nasceu com o propósito de integrar soluções essenciais para o desenvolvimento da sociedade. Desde o início, nossa missão tem sido clara: entregar excelência em cada projeto, seja na construção de um novo lar, na implementação de tecnologias para gestão pública ou na proteção do patrimônio das famílias brasileiras.
            </p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginBottom: '30px' }}>
              Com uma equipe multidisciplinar e apaixonada pelo que faz, crescemos fundamentados na ética, na transparência e no compromisso com resultados. Hoje, somos referência em múltiplos setores, sempre mantendo o cliente no centro de nossas decisões.
            </p>
            <Button primary href="/contact">
              Fale com Nossa Equipe <FaArrowRight style={{ marginLeft: '10px', verticalAlign: 'middle' }} />
            </Button>
          </TextColumn>
        </GridContainer>
      </Section>

      {/* Nossos Pilares */}
      <Section bg="#f8f9fa">
        <div className="content-wrapper" style={{ textAlign: 'center', width: '100%' }}>
          <h2 className="section-title" style={{ marginBottom: '60px' }}>Nossos Pilares</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <ValueCard>
              <FaLightbulb />
              <h3>Inovação</h3>
              <p>Buscamos constantemente novas tecnologias e métodos para oferecer soluções mais eficientes e modernas.</p>
            </ValueCard>
            <ValueCard>
              <FaHandshake />
              <h3>Compromisso</h3>
              <p>Honramos cada acordo e prazo. A confiança dos nossos clientes é o nosso maior ativo.</p>
            </ValueCard>
            <ValueCard>
              <FaShieldAlt />
              <h3>Segurança</h3>
              <p>Priorizamos a segurança em todas as nossas operações, desde canteiros de obras até a proteção de dados.</p>
            </ValueCard>
            <ValueCard>
              <FaUsers />
              <h3>Foco no Cliente</h3>
              <p>Entendemos as necessidades de cada cliente para entregar soluções personalizadas e assertivas.</p>
            </ValueCard>
          </div>
        </div>
      </Section>

      {/* CTA Final */}
      <section className="contact-section" style={{ textAlign: 'center' }}>
        <div className="content-wrapper" style={{ flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <h2 className="section-title" style={{ color: '#fff' }}>Faça Parte da Nossa História</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Estamos prontos para ajudar você a realizar seus projetos e sonhos.
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
            Entre em Contato
          </Button>
        </div>
      </section>

      <Footer />
      <a href="https://wa.me/5585987864953" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contato via WhatsApp">
          <FaWhatsapp />
      </a>
    </div>
  );
};

export default AboutPage;
