import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaUser, FaIdCard, FaCalendarAlt, FaPhone, FaEnvelope, FaFileMedical, FaUpload, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const CadastroExterno = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [vendedorInfo, setVendedorInfo] = useState({ id: '', nome: '' });

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    plano: '',
    tipo: 'Titular'
  });

  const [docs, setDocs] = useState({
    rgCnh: null,
    comprovanteEndereco: null
  });

  // Captura parâmetros da URL (Vendedor)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('vendedorId');
    const nome = params.get('vendedorNome');
    
    if (id || nome) {
      setVendedorInfo({
        id: id || '',
        nome: nome || ''
      });
    }
  }, [location]);

  // Máscaras
  const maskCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const maskPhone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  const maskDate = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'cpf') finalValue = maskCPF(value);
    if (name === 'telefone') finalValue = maskPhone(value);
    if (name === 'dataNascimento') finalValue = maskDate(value);

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setDocs(prev => ({ ...prev, [fieldName]: base64 }));
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      USUARIO: formData.nome,
      CPF: formData.cpf,
      'DATA NASC': formData.dataNascimento,
      TELEFONE: formData.telefone,
      EMAIL: formData.email,
      PLANO: formData.plano,
      CONTRATO: formData.tipo,
      // Campos ocultos/padrão
      MENSALIDADE: '0', 
      ValorAdesao: '0',
      STATUS: 'Pendente', // Entra como pendente para análise
      OBSERVACAO: 'Cadastro realizado via Link Externo',
      'ADESÃO': new Date().toLocaleDateString('pt-BR'),
      VENDEDOR: vendedorInfo.id,
      documentos: {
        rgCnh: docs.rgCnh || '',
        comprovanteEndereco: docs.comprovanteEndereco || ''
      }
    };

    try {
      const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/clientes.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        alert("Erro ao enviar cadastro. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', color: '#28a745' }}>
            <FaCheckCircle size={60} />
            <h2>Cadastro Recebido!</h2>
            <p>Seus dados foram enviados com sucesso. Em breve entraremos em contato.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, color: '#333' }}>Ficha de Cadastro</h2>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Preencha seus dados para prosseguir com a adesão.</p>
          {vendedorInfo.nome && (
            <div style={styles.vendedorBadge}>
              <small>Consultor: <strong>{vendedorInfo.nome}</strong></small>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}><FaUser /> Nome Completo</label>
            <input required name="nome" value={formData.nome} onChange={handleChange} style={styles.input} placeholder="Seu nome completo" />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaIdCard /> CPF</label>
              <input required name="cpf" value={formData.cpf} onChange={handleChange} style={styles.input} placeholder="000.000.000-00" maxLength="14" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaCalendarAlt /> Data Nasc.</label>
              <input required name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} style={styles.input} placeholder="DD/MM/AAAA" maxLength="10" />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaPhone /> Telefone/WhatsApp</label>
              <input required name="telefone" value={formData.telefone} onChange={handleChange} style={styles.input} placeholder="(00) 00000-0000" maxLength="15" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaEnvelope /> E-mail</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} placeholder="seu@email.com" />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaFileMedical /> Plano de Interesse</label>
              <input required name="plano" value={formData.plano} onChange={handleChange} style={styles.input} placeholder="Ex: Plano de Saúde X" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tipo</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} style={styles.input}>
                <option value="Titular">Titular</option>
                <option value="Dependente">Dependente</option>
              </select>
            </div>
          </div>

          <div style={styles.divider}></div>
          <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>Documentação (Fotos ou PDF)</h4>

          <div style={styles.fileInputContainer}>
            <label style={styles.label}>RG ou CNH</label>
            <div style={styles.fileWrapper}>
                <label htmlFor="rgCnh" style={styles.uploadBtn}>
                    <FaUpload /> {docs.rgCnh ? 'Arquivo Selecionado' : 'Escolher Arquivo'}
                </label>
                <input id="rgCnh" type="file" onChange={(e) => handleFileChange(e, 'rgCnh')} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={styles.fileInputContainer}>
            <label style={styles.label}>Comprovante de Endereço</label>
            <div style={styles.fileWrapper}>
                <label htmlFor="compEnd" style={styles.uploadBtn}>
                    <FaUpload /> {docs.comprovanteEndereco ? 'Arquivo Selecionado' : 'Escolher Arquivo'}
                </label>
                <input id="compEnd" type="file" onChange={(e) => handleFileChange(e, 'comprovanteEndereco')} style={{ display: 'none' }} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? <><FaSpinner className="icon-spin" /> Enviando...</> : 'Enviar Cadastro'}
          </button>
        </form>
      </div>
      <style>{`
        .icon-spin { animation: spin 1s linear infinite; margin-right: 5px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '600px',
    padding: '30px',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px'
  },
  vendedorBadge: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '5px 10px',
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
    borderRadius: '15px',
    fontSize: '0.9rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    '@media (max-width: 500px)': {
        gridTemplateColumns: '1fr'
    }
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#444',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  divider: {
    height: '1px',
    backgroundColor: '#eee',
    margin: '10px 0'
  },
  fileInputContainer: {
    marginBottom: '10px'
  },
  fileWrapper: {
    marginTop: '5px'
  },
  uploadBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    border: '1px dashed #ccc',
    borderRadius: '5px',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    color: '#555',
    justifyContent: 'center'
  },
  submitBtn: {
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s'
  }
};

export default CadastroExterno;
