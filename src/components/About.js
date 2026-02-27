import React from 'react';
import ImageSectionAbout from '../assets/images/visao2.jpg';
import Button from '../pages/Button';

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
            <Button className="about-button" href="/contact">SAIBA MAIS SOBRE NÓS</Button>
        </div>
    </section>
);

export default About;