import React from 'react';

const Contact = () => (
    <section id="contact" className="contact-section">
        <h2 className="section-title">Fale Conosco</h2>
        <p className="section-subtitle">
            Pronto para levar seu projeto adiante? Envie uma mensagem e vamos construir o futuro juntos!
        </p>
        <form className="contact-form">
            <input type="text" placeholder="Nome Completo" required className="input-field" />
            <input type="email" placeholder="E-mail" required className="input-field" />
            <button type="submit" className="btn btn-primary submit-button">ENVIAR MENSAGEM</button>
        </form>
    </section>
);

export default Contact;