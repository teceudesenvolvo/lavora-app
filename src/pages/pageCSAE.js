import React from 'react';
import { Link } from 'react-router-dom';

const PageCsae = () => {
  const styles = {
    container: {
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
      lineHeight: '1.7',
      color: '#2d3436',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '60px 24px',
      backgroundColor: '#ffffff',
    },
    header: {
      textAlign: 'center',
      marginBottom: '50px',
      paddingBottom: '30px',
      borderBottom: '1px solid #edf2f7',
    },
    brandName: {
      fontSize: '28px',
      fontWeight: '800',
      color: '#2563eb',
      letterSpacing: '-0.5px',
      textTransform: 'uppercase'
    },
    title: {
      fontSize: '2.4rem',
      color: '#1a202c',
      margin: '12px 0',
      fontWeight: '700'
    },
    meta: {
      color: '#718096',
      fontSize: '0.95rem',
    },
    content: {
      textAlign: 'left',
    },
    section: {
      marginBottom: '40px'
    },
    sectionTitle: {
      fontSize: '1.6rem',
      color: '#1e40af',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    paragraph: {
      marginBottom: '18px',
      fontSize: '1.05rem',
    },
    highlightBox: {
      backgroundColor: '#f1f5f9',
      padding: '24px',
      borderRadius: '12px',
      borderLeft: '5px solid #2563eb',
      margin: '25px 0',
    },
    list: {
      paddingLeft: '24px',
      marginBottom: '20px',
    },
    listItem: {
      marginBottom: '12px',
    },
    footer: {
      marginTop: '60px',
      textAlign: 'center',
      paddingTop: '30px',
      borderTop: '1px solid #edf2f7',
      color: '#a0aec0',
      fontSize: '0.9rem'
    },
    footerLinks: {
      marginTop: '20px',
      display: 'flex',
      justifyContent: 'center',
      gap: '20px'
    },
    link: {
      color: '#718096',
      textDecoration: 'none',
      fontSize: '0.9rem'
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brandName}>OAssessor</div>
        <h1 style={styles.title}>Compromisso com a Segurança Infantil (CSAE)</h1>
        <p style={styles.meta}>Política de Tolerância Zero</p>
      </header>

      <div style={styles.content}>
        <section style={styles.section}>
          <p style={styles.paragraph}>
            Garantir um ambiente digital seguro é a nossa prioridade. Conheça as nossas políticas e diretrizes contra o abuso e exploração sexual infantil.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. O que é CSAE?</h2>
          <p style={styles.paragraph}>
            CSAE (Child Sexual Abuse and Exploitation) refere-se a qualquer forma de abuso, exploração ou material de abuso sexual infantil. OAssessor mantém uma política de tolerância zero absoluta para qualquer conteúdo ou comportamento desta natureza em nossa plataforma.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Nossa Política de Conformidade</h2>
          <p style={styles.paragraph}>
            OAssessor, desenvolvido pela <strong>Lavoro Serviços</strong>, cumpre rigorosamente as leis internacionais e locais de proteção à criança. O nosso compromisso vai além do cumprimento legal; é uma missão ética proteger os mais vulneráveis.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Prevenção:</strong> Implementamos filtros de segurança em todos os uploads de ficheiros e comunicações internas do sistema.</li>
            <li style={styles.listItem}><strong>Acção Imediata:</strong> Contas envolvidas em atividades suspeitas são suspensas permanentemente e reportadas às autoridades competentes.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Mecanismos de Monitoramento</h2>
          <p style={styles.paragraph}>
            Utilizamos tecnologias avançadas de hash e inteligência artificial para identificar conteúdos conhecidos de abuso infantil. Além disso, revisores humanos processam denúncias 24/7 para garantir que a plataforma permaneça segura para todos.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Como Denunciar</h2>
          <p style={styles.paragraph}>
            Se encontrar qualquer indício de violação, é crucial agir imediatamente.
          </p>
          <div style={styles.highlightBox}>
            <strong>Canal de Denúncia:</strong><br />
            Envie um e-mail imediato para:
            <a href="mailto:seguranca@oassessor.com.br" style={{ color: '#2563eb', marginLeft: '5px', textDecoration: 'none' }}>
              seguranca@oassessor.com.br
            </a>
            <br /><br />
            Todas as denúncias são anónimas e tratadas com prioridade máxima.
          </div>
          <p style={styles.paragraph}>
             Você também pode reportar globalmente através do <a href="https://www.missingkids.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>NCMEC</a>.
          </p>
        </section>
      </div>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} OAssessor — Desenvolvido por Lavoro Serviços.</p>
        <div style={styles.footerLinks}>
            <Link to="/politica-de-privacidade-oassessor" style={styles.link}>Política de Privacidade</Link>
            <Link to="/" style={styles.link}>Termos de Uso</Link>
        </div>
      </footer>
    </div>
  );
};

export default PageCsae;