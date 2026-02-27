// src/pages/ContactPage.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import { FaWhatsapp } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="lavoro-app-container">
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <Contact />
      </div>
      <Footer />
      <a href="https://wa.me/5585987864953" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contato via WhatsApp">
          <FaWhatsapp />
      </a>
    </div>
  );
};

export default ContactPage;
