// src/pages/ContactPage.js
// src/pages/ContactPage.js
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import { FaWhatsapp, FaEnvelope, FaPhone, FaUserTie } from 'react-icons/fa';

const ContactPage = () => {
  const [team, setTeam] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/equipe.json');
        const data = await response.json();
        if (data) {
          const loadedTeam = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).filter(member => member.status === 'Ativo'); // Apenas membros ativos
          
          // Ordenar por cargo (opcional, mas bom para organograma)
          const roleOrder = { 'Admin': 1, 'Financeiro': 2, 'Vendedor': 3, 'Suporte': 4 };
          loadedTeam.sort((a, b) => (roleOrder[a.cargo] || 99) - (roleOrder[b.cargo] || 99));

          setTeam(loadedTeam);
        }
      } catch (error) {
        console.error("Erro ao buscar equipe:", error);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="lavoro-app-container">
      <Header />
      <div className="page-wrapper" style={{ paddingTop: '80px' }}>
        
        {/* Formulário de Contato Existente */}
        <Contact />

        {/* Nova Seção: Organograma / Nossa Equipe */}
        <section className="team-section">
            <h2 className="team-section-title">Nossa Equipe</h2>
            <p className="team-section-subtitle">
                Conheça os profissionais dedicados que fazem o Grupo Lavoro acontecer. Estamos à disposição para atendê-lo.
            </p>

            <div className="team-grid">
                {team.map((member) => (
                    <div className="team-card" key={member.id}>
                        <div className="team-avatar">
                            {/* Se houver foto, usar img, senão ícone ou iniciais */}
                            {member.foto ? <img src={member.foto} alt={member.nome} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} /> : <FaUserTie />}
                        </div>
                        <h3 className="member-name">{member.nome}</h3>
                        
                        <div className="contact-info-container">
                            {member.email && (
                                <div className="contact-info-item">
                                    <FaEnvelope style={{ color: '#1e90ff' }} />
                                    <a href={`mailto:${member.email}`} className="contact-info-link">{member.email}</a>
                                </div>
                            )}
                            {/* Exibe telefone se existir no cadastro */}
                            {member.telefone && (
                                <div className="contact-info-item">
                                    <FaPhone style={{ color: '#25d366' }} />
                                    <a href={`tel:${member.telefone}`} className="contact-info-link">{member.telefone}</a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {team.length === 0 && <p>Carregando equipe...</p>}
            </div>
        </section>

      </div>
      <Footer />
      <a href="https://wa.me/5585987864953" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contato via WhatsApp">
          <FaWhatsapp />
      </a>
    </div>
  );
};

export default ContactPage;
