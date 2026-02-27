import React from 'react';

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

export default Testimonials;