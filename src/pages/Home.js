import React, { useState } from 'react';
import { FaWhatsapp, FaHospital, FaAmbulance, FaTooth, FaHeartbeat } from 'react-icons/fa';
import ImageHero from '../assets/images/hero.jpg'; // Imagem da Mulher em movimento
import Button from './Button';
import Header from '../components/Header'; // Import the reusable Header component
import Footer from '../components/Footer';
import Solutions from '../components/Solutions';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import Contact from '../components/Contact';

// Seção 1: Hero
const Hero = () => (
  <section id="hero" className="hero-section">
    <div className="content-wrapper">
      <div className="hero-text-container">
        <h1 className="hero-title">
          Transforme sua visão em Realidade
        </h1>
        <p className="hero-subtitle">
          Mais do que serviços, entregamos soluções integradas utilizando tecnologia de ponta em todos os serviços.
        </p>
        <Button primary href="#solutions">
          Explore Nossas Soluções
        </Button>
      </div>
    </div>
    <div className="hero-image-container">
        <img src={ImageHero} alt="Mulher em movimento" className="hero-image" />
    </div>
  </section>
);

// Nova Seção: Hapvida (Corretora Exclusiva)
const HapvidaSection = () => {
  const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    dataNascimento: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuoteFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
        USUARIO: quoteFormData.nome,
        TELEFONE: quoteFormData.telefone,
        EMAIL: quoteFormData.email,
        'DATA NASC': quoteFormData.dataNascimento ? quoteFormData.dataNascimento.split('-').reverse().join('/') : '',
        STATUS: 'Cotação',
        'ADESÃO': new Date().toLocaleDateString('pt-BR'),
        origem: 'Site - Hapvida Section'
    };

    try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Solicitação enviada com sucesso! Entraremos em contato em breve.');
            setQuoteModalOpen(false);
            setQuoteFormData({ nome: '', telefone: '', email: '', dataNascimento: '' });
        } else {
            alert('Erro ao enviar solicitação. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao enviar solicitação.');
    }
  };

  return (
  <section className="hapvida-section" style={{ padding: '100px 20px', background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)' }}>
    <div className="content-wrapper hapvida-content-wrapper">
      

      {/* Coluna de Cards e Botão (Esquerda no Desktop) */}
      <div className="hapvida-cards-column">
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '40px',
            width: '100%'
        }}>
            {[
                { title: 'Maior Rede Exclusiva', icon: <FaHospital /> },
                { title: 'Urgência e Emergência 24h', icon: <FaAmbulance /> },
                { title: 'Odontologia Completa', icon: <FaTooth /> },
                { title: 'Programas de Prevenção', icon: <FaHeartbeat /> }
            ].map((item, index) => (
                <div key={index} className="hapvida-feature-card">
                    <div style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#e5731b' }}>{item.icon}</div>
                    <h3 style={{ color: '#0054a6', fontSize: '1.1rem', fontWeight: 'bold' }}>{item.title}</h3>
                </div>
            ))}
        </div>

        <div className="hapvida-cta-container">
            <Button primary onClick={() => setQuoteModalOpen(true)} className="hapvida-cta-button">
                Solicitar Cotação Personalizada
            </Button>
        </div>
      </div>
      {/* Coluna de Texto (Direita no Desktop) */}
      <div className="hapvida-text-column">
        <div className="hapvida-logo-container">
            <img 
                src="https://www2.hapvida.com.br/o/hapvida-theme/images/logo.png" 
                alt="Hapvida Logo" 
                style={{ height: '80px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} 
            />
        </div>

        <h2 className="section-title hapvida-title">
            Excelência em Saúde e Odontologia
        </h2>
        
        <p className="section-subtitle hapvida-subtitle">
            Como corretora exclusiva <strong>Hapvida</strong>, o Grupo Lavoro conecta você à maior rede verticalizada de saúde do Brasil. 
            Oferecemos soluções personalizadas com o melhor custo-benefício do mercado, garantindo tranquilidade e bem-estar para quem você ama.
        </p>
      </div>

    </div>

    {isQuoteModalOpen && (
        <div className="popup-overlay" onClick={() => setQuoteModalOpen(false)}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
                <button className="popup-close" onClick={() => setQuoteModalOpen(false)}>&times;</button>
                <h2 className="popup-title" style={{color: '#0054a6'}}>Cotação Hapvida</h2>
                <p className="popup-description">Preencha seus dados para receber uma proposta exclusiva.</p>
                
                <form onSubmit={handleQuoteSubmit} className="contact-form" style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    <input 
                        type="text" 
                        name="nome" 
                        placeholder="Nome Completo" 
                        required 
                        className="input-field" 
                        value={quoteFormData.nome}
                        onChange={handleInputChange}
                    />
                    <input 
                        type="tel" 
                        name="telefone" 
                        placeholder="Telefone / WhatsApp" 
                        required 
                        className="input-field" 
                        value={quoteFormData.telefone}
                        onChange={handleInputChange}
                    />
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="E-mail" 
                        required 
                        className="input-field" 
                        value={quoteFormData.email}
                        onChange={handleInputChange}
                    />
                    <div style={{textAlign: 'left'}}>
                        <label style={{fontSize: '0.9rem', color: '#666', marginLeft: '5px'}}>Data de Nascimento</label>
                        <input 
                            type="date" 
                            name="dataNascimento" 
                            required 
                            className="input-field" 
                            value={quoteFormData.dataNascimento}
                            onChange={handleInputChange}
                        />
                    </div>
                    <Button primary type="submit" className="submit-button" style={{width: '100%', marginTop: '10px'}}>
                        Enviar Solicitação
                    </Button>
                </form>
            </div>
        </div>
    )}
  </section>
);
};

// Componente Home que junta todas as seções
const Home = () => {
    return (
        <div className="lavoro-app-container">
            <Header />
            <Hero />
            <HapvidaSection />
            <Solutions />
            <About />
            <Testimonials />
            <Contact />
            <Footer />
            <a href="https://wa.me/5585987864953" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contato via WhatsApp">
                <FaWhatsapp />
            </a>
        </div>
    );
};

export default Home;
