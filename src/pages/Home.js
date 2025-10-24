import React from 'react';
import ImageHero from '../assets/images/hero.jpg'; // Imagem da Mulher em movimento
import ImageSectionAbout from '../assets/images/visao2.jpg'; // Imagem do Homem se alongando

// Componente Básico de Botão
const Button = ({ children, primary, className = '', href, onClick }) => (
  <a 
    href={href} 
    onClick={onClick}
    className={`btn ${primary ? 'btn-primary' : 'btn-secondary'} ${className}`}
  >
    {children}
  </a>
);

// --- Componentes de Seção (Modularizados) ---

// Seção 1: Hero
const Hero = () => (
  <section id="hero" className="hero-section">
    <div className="content-wrapper">
      <div className="hero-text-container">
        <h1 className="hero-title">
          Transforme Sua Visão Em Realidade.
        </h1>
        <p className="hero-subtitle">
          Mais do que serviços, entregamos soluções integradas em Construção Civil, Tecnologia, Seguros e Consórcios. Sua próxima grande conquista começa aqui.
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

// Seção 2: Solutions
const Solutions = () => {
  const solutionsData = [
    { title: 'Construção Civil', subtitle: 'Projetos que inspiram e edificam o futuro.', color: '#ff69b4' }, // Rosa
    { title: 'Lavoro Tech', subtitle: 'Soluções em software para a gestão pública.', color: '#1e90ff' }, // Azul
    { title: 'Seguros', subtitle: 'Sua tranquilidade e patrimônio protegidos.', color: '#ffa500' }, // Laranja
    { title: 'Consórcios', subtitle: 'O caminho inteligente para suas conquistas.', color: '#3cb371' }, // Verde
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
          <div key={index} className="solution-card" style={{ backgroundColor: sol.color }}>
            {/* Ícone placeholder para cada serviço */}
            <h3 className="card-title">{sol.title}</h3>
            <p className="card-subtitle">{sol.subtitle}</p>
          </div>
        ))}
      </div>
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
            quote: "A Lavoro Constrói entregou nosso projeto comercial com uma eficiência surpreendente. Qualidade impecável e gestão transparente do início ao fim. Profissionalismo exemplar!", 
            name: "J. Costa", 
            title: "CEO, Costa Empreendimentos" 
        },
        { 
            quote: "Com o software da Lavoro Tech, a gestão de nosso departamento público se tornou muito mais ágil e eficiente. Uma verdadeira revolução para nossos processos e atendimento.", 
            name: "M. Alves", 
            title: "Secretária Municipal de Finanças" 
        },
        { 
            quote: "Sempre tive dificuldade em entender seguros, mas a Lavoro Protege simplificou tudo. Encontraram a cobertura perfeita para minha família, com um atendimento que superou as expectativas.", 
            name: "A. Santos", 
            title: "Cliente Satisfeita" 
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

// Seção 5: Gallery (Portfólio em Destaque)
const Gallery = () => (
    <section id="gallery" className="gallery-section">
        <div className="gallery-grid">
            {/* 4 Imagens Placeholder para portfólio */}
            <div className="gallery-item item-1"></div>
            <div className="gallery-item item-2"></div>
            <div className="gallery-item item-3"></div>
            <div className="gallery-item item-4"></div>
        </div>
    </section>
);

// Seção 6: Contact (Fale Conosco)
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
        <div className="social-media">
             {/* Ícones de Mídias Sociais - placeholders */}
            <a href="https://facebook.com/grupolavoro" target="_blank" rel="noopener noreferrer" aria-label="Facebook">F</a>
            <a href="https://instagram.com/grupolavoro" target="_blank" rel="noopener noreferrer" aria-label="Instagram">I</a>
            <a href="https://linkedin.com/company/grupolavoro" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">L</a>
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
            {/* Não incluí o Header (Menu Fixo) para manter a simplicidade da SPA, mas ele viria aqui */}
            <Hero />
            <Solutions />
            <About />
            <Testimonials />
            <Gallery />
            <Contact />
            <Footer />
        </div>
    );
};

export default Home;
