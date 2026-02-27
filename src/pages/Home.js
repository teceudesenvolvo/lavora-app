import React, { useState } from 'react';
import { FaWhatsapp, FaHospital, FaAmbulance, FaTooth, FaHeartbeat } from 'react-icons/fa';
import ImageHero from '../assets/images/hero.jpg'; // Imagem da Mulher em movimento
import ImageSectionAbout from '../assets/images/visao2.jpg'; // Imagem do Homem se alongando
import Button from './Button';
import Header from '../components/Header'; // Import the reusable Header component

// Componente do Popup
const Popup = ({ solution, onClose }) => (
  <div className="popup-overlay" onClick={onClose}>
    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
      <button className="popup-close" onClick={onClose}>&times;</button>
      <h2 className="popup-title">{solution.title}</h2>
      <p className="popup-description">{solution.description}</p>
      <Button primary href="#contact" onClick={onClose}>Fale Conosco</Button>
    </div>
  </div>
);

// --- Componentes de Seção (Modularizados) ---

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

    <style>{`
        .hapvida-content-wrapper {
            display: flex;
            flex-direction: row-reverse;
            align-items: center;
            gap: 60px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .hapvida-text-column {
            flex: 1;
            text-align: right;
        }
        .hapvida-cards-column {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .hapvida-logo-container {
            margin-bottom: 30px;
            display: flex;
            justify-content: flex-end;
        }
        .hapvida-title {
            color: #0054a6;
            font-size: 2.8rem;
            margin-bottom: 25px;
            font-weight: 800;
            text-align: right;
        }
        .hapvida-subtitle {
            font-size: 1.25rem;
            color: #4a5568;
            line-height: 1.8;
            text-align: right;
            margin-left: auto;
            margin-right: 0;
            margin-bottom: 0;
            max-width: 100%;
        }
        .hapvida-feature-card {
            background: #ffffff;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,84,166,0.08);
            transition: transform 0.3s ease;
            cursor: default;
            text-align: center;
        }
        .hapvida-feature-card:hover {
            transform: translateY(-5px);
        }
        .hapvida-cta-container {
            text-align: left;
        }
        .hapvida-cta-button {
            padding: 18px 45px !important;
            font-size: 1.2rem !important;
            border-radius: 50px !important;
            box-shadow: 0 4px 15px rgba(0, 84, 166, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .hapvida-cta-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(0, 84, 166, 0.4);
        }

        @media (max-width: 992px) {
            .hapvida-content-wrapper {
                flex-direction: column;
                gap: 40px;
            }
            .hapvida-text-column {
                text-align: center;
            }
            .hapvida-logo-container {
                justify-content: center;
            }
            .hapvida-title {
                text-align: center;
                font-size: 2.2rem;
            }
            .hapvida-subtitle {
                text-align: center;
                margin: 0 auto;
            }
            .hapvida-cta-container {
                text-align: center;
            }
        }
    `}</style>
  </section>
);
};

// Seção 2: Solutions
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
            {/* Ícone placeholder para cada serviço */}
            <h3 className="card-title">{sol.title}</h3>
            <p className="card-subtitle">{sol.subtitle}</p>
          </div>
        ))}
      </div>
      {selectedSolution && <Popup solution={selectedSolution} onClose={() => setSelectedSolution(null)} />}
    </section>
  );
};

// Seção 3: About (Quem Somos)
const About = () => (
    <section id="about" className="about-section">
        <div className="about-image-container">
             <img src={ImageSectionAbout} alt="Visao" className="about-image" />
        </div>
        <div className="about-content">
            <h2 className="section-title">Quem Somos?</h2>
            <p className="about-text">
                O Grupo Lavoro é a força motriz por trás de projetos inovadores e seguros. Desde a fundação de empreendimentos ambiciosos até o desenvolvimento de tecnologias que transformam a gestão pública e a garantia de proteção para o seu futuro, somos parceiros estratégicos que unem visão, expertise e tecnologia de ponta para entregar resultados excepcionais.
            </p>
            <Button className="about-button" href="#contact">SAIBA MAIS SOBRE NÓS</Button>
        </div>
    </section>
);

// Seção 4: Testimonials (O Que Nossos Clientes Dizem)
const Testimonials = () => {
    const testimonialsData = [
        { 
            quote: "A Lavoro Constrói entregou nosso projeto com uma eficiência surpreendente. Qualidade impecável e gestão transparente do início ao fim. Profissionalismo exemplar!", 
            name: "Fernando Matos Santana", 
            title: "Secretario de Recursos Hidricos do Ceará" 
        },
        { 
            quote: "Com o software da Lavoro Tech, a gestão de nosso departamento público se tornou muito mais ágil e eficiente. Uma verdadeira revolução para nossos processos e atendimento.", 
            name: "M. Alves", 
            title: "Secretária Municipal de Finanças" 
        },
        { 
            quote: "Sempre tive dificuldade em entender seguros, mas a Lavoro Protege simplificou tudo. Encontraram a cobertura perfeita para minha família, com um atendimento que superou as expectativas.", 
            name: "A. Santos", 
            title: "Shirley Santos" 
        },
    ];

    return (
        <section id="testimonials" className="testimonials-section">
            <h2 className="section-title">
                <span className="quote-icon">“</span> O Que Nossos Clientes <span className="blue-text">Dizem Sobre Nós</span>
            </h2>
            <div className="testimonials-container">
                {testimonialsData.map((t, index) => (
                    <div key={index} className="testimonial-card">
                        <p className="testimonial-quote">{t.quote}</p>
                        <div className="client-info">
                             {/* Placeholder para a imagem do cliente */}
                            <div className="client-details">
                                <p className="client-name">{t.name}</p>
                                <p className="client-title">{t.title}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// Seção 5: Contact (Fale Conosco)
const Contact = () => (
    <section id="contact" className="contact-section">
        <h2 className="section-title">Fale Conosco</h2>
        <p className="section-subtitle">
            Pronto para levar seu projeto adiante? Envie uma mensagem e vamos construir o futuro juntos!
        </p>
        <form className="contact-form">
            <input type="text" placeholder="Nome Completo" required className="input-field" />
            <input type="email" placeholder="E-mail" required className="input-field" />
            {/* Usamos o componente Button como um link para simplicidade, mas aqui precisamos de um botão real para submit */}
            <button type="submit" className="btn btn-primary submit-button">ENVIAR MENSAGEM</button>
        </form>
    </section>
);

// Rodapé
const Footer = () => (
    <footer className="footer-section">
        <div className="footer-links">
            <a href="#hero">Início</a>
            <a href="#about">Sobre Nós</a>
            <a href="#solutions">Soluções</a>
            <a href="#gallery">Portfólio</a>
            <a href="#contact">Contato</a>
        </div>
       
        <p className="copyright">
            Grupo Lavoro © 2025. Todos os Direitos Reservados.
        </p>
    </footer>
);


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
