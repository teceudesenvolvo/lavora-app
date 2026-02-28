import React, { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        nome: '',
        email: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            USUARIO: formData.nome,
            EMAIL: formData.email,
            STATUS: 'Contato',
            'ADESÃO': new Date().toLocaleDateString('pt-BR'),
            origem: 'Site - Fale Conosco'
        };

        try {
            const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
                setFormData({ nome: '', email: '' });
            } else {
                alert('Erro ao enviar mensagem. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar mensagem.');
        }
    };

    return (
        <section id="contact" className="contact-section">
            <h2 className="section-title">Fale Conosco</h2>
            <p className="section-subtitle">
                Pronto para levar seu projeto adiante? Envie uma mensagem e vamos construir o futuro juntos!
            </p>
            <form className="contact-form" onSubmit={handleSubmit}>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome Completo" required className="input-field" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="E-mail" required className="input-field" />
                <button type="submit" className="btn btn-primary submit-button">ENVIAR MENSAGEM</button>
            </form>
        </section>
    );
};

export default Contact;