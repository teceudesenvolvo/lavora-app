import React from 'react';

const App = () => {
  // Estilos profissionais para uma aplicação de assessoria
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
      color: '#2563eb', // Azul moderno para OAssessor
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
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.brandName}>OAssessor</div>
        <h1 style={styles.title}>Política de Privacidade</h1>
        <p style={styles.meta}>Versão 1.0 — Atualizado em 03 de Novembro de 2025</p>
      </header>

      <div style={styles.content}>
        <section style={styles.section}>
          <p style={styles.paragraph}>
            Bem-vindo ao <strong>OAssessor</strong>. A sua privacidade é uma prioridade fundamental para nós. Esta política explica como a nossa plataforma gere as informações no contexto da prestação de serviços de assessoria e gestão.
          </p>
          <p style={styles.paragraph}>
            Ao utilizar o aplicativo OAssessor, o utilizador concorda com a recolha e o uso de informações de acordo com esta política, desenhada para cumprir as diretrizes da Lei Geral de Proteção de Dados (LGPD).
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>1. Responsabilidade e Controlo</h2>
          <p style={styles.paragraph}>
            A gestão e operação dos dados no ecossistema OAssessor é coordenada pela <strong>Lavoro Serviços</strong> (CNPJ: 45.140.973/0001-64). Atuamos como operadores e controladores, garantindo que a tecnologia de assessoria respeita os limites éticos e legais.
          </p>
          <div style={styles.highlightBox}>
            <strong>Contacto do Encarregado (DPO):</strong><br />
            Para questões de privacidade, contacte-nos através do e-mail: 
            <a href="mailto:privacidade@oassessor.com.br" style={{ color: '#2563eb', marginLeft: '5px', textDecoration: 'none' }}>
              privacidade@oassessor.com.br
            </a>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>2. Dados que Processamos</h2>
          <p style={styles.paragraph}>
            OAssessor recolhe informações necessárias para a eficiência da sua assessoria:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}><strong>Dados de Perfil:</strong> Nome, cargo e informações de contacto fornecidas voluntariamente para personalização do serviço.</li>
            <li style={styles.listItem}><strong>Interações de Assessoria:</strong> Conteúdos e solicitações processadas dentro do app para gerar relatórios e assistência.</li>
            <li style={styles.listItem}><strong>Dados Técnicos:</strong> Identificadores de dispositivo, logs de acesso e métricas de desempenho para garantir a estabilidade da ferramenta.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>3. Finalidade do Tratamento</h2>
          <p style={styles.paragraph}>Utilizamos os dados para:</p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Otimizar o fluxo de trabalho de assessoria do utilizador.</li>
            <li style={styles.listItem}>Personalizar recomendações e automações inteligentes.</li>
            <li style={styles.listItem}>Garantir a segurança cibernética da conta do utilizador.</li>
            <li style={styles.listItem}>Enviar atualizações críticas de sistema e novas funcionalidades.</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>4. Segurança da Informação</h2>
          <p style={styles.paragraph}>
            Implementamos protocolos de criptografia de ponta e firewalls avançados. Os dados processados pelo OAssessor são tratados como confidenciais e protegidos contra acessos não autorizados por meio de autenticação multifator e auditorias regulares.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>5. Direitos do Utilizador</h2>
          <p style={styles.paragraph}>
            Como utilizador do OAssessor, tem o direito pleno de solicitar:
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>Acesso aos dados que mantemos sobre a sua atividade.</li>
            <li style={styles.listItem}>A correção de dados imprecisos ou desatualizados.</li>
            <li style={styles.listItem}>A eliminação definitiva da sua conta e dados associados (respeitando prazos legais de retenção).</li>
          </ul>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>6. Jurisdição</h2>
          <p style={styles.paragraph}>
            Esta política é regida pelas leis da República Federativa do Brasil, especificamente pela LGPD, independentemente da localização geográfica do utilizador ao aceder ao OAssessor.
          </p>
        </section>
      </div>

      <footer style={styles.footer}>
        <p>© {new Date().getFullYear()} OAssessor — Desenvolvido por Lavoro Serviços.</p>
      </footer>
    </div>
  );
};

export default App;