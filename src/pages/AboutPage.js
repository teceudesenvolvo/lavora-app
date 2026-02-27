// src/pages/AboutPage.js
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import About from '../components/About';
import Testimonials from '../components/Testimonials';
import { FaWhatsapp } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="lavoro-app-container">
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <About />
        <Testimonials />
      </div>
      <Footer />
      <a href="https://wa.me/5585987864953" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contato via WhatsApp">
          <FaWhatsapp />
      </a>
    </div>
  );
};

export default AboutPage;
