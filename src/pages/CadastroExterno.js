import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaUser, FaIdCard, FaCalendarAlt, FaPhone, FaEnvelope, FaFileMedical, FaUpload, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import Logo from '../assets/images/logo-GL.png';

const CadastroExterno = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [vendedorInfo, setVendedorInfo] = useState({ id: '', nome: '' });
  const [titularInfo, setTitularInfo] = useState({ id: '', nome: '' });
  const [planos, setPlanos] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    dataNascimento: '',
    telefone: '',
    email: '',
    planoId: '',
    tipo: 'Titular',
    vencimento: '',
    titularId: ''
  });

  const [docs, setDocs] = useState({
    rgCnh: null, // Armazenará o objeto File
    comprovanteEndereco: null // Armazenará o objeto File
  });

  // URL base das Cloud Functions
  const CLOUD_FUNCTIONS_BASE = 'https://us-central1-lavoro-servicos-c10fd.cloudfunctions.net';

  // Captura parâmetros da URL (Vendedor)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('vendedorId');
    const nome = params.get('vendedorNome');
    const tId = params.get('titularId');
    const tNome = params.get('titularNome');
    
    if (id || nome) {
      setVendedorInfo({
        id: id || '',
        nome: nome || ''
      });
    }
    if (tId) {
      setTitularInfo({ id: tId, nome: tNome || '' });
      setFormData(prev => ({ ...prev, tipo: 'Dependente', titularId: tId }));
    }
  }, [location]);

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const response = await fetch('https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com/planos.json');
        const data = await response.json();
        console.log("Planos disponíveis:", data);
        if (data) {
          const lista = Object.keys(data).map(key => {
            const item = data[key];
            if (!item) return null;
            return { id: key, ...item };
          }).filter(plano => plano && (!plano.status || plano.status === 'Ativo'));
          setPlanos(lista);
        }
      } catch (error) {
        console.error("Erro ao buscar planos:", error);
      }
    };
    fetchPlanos();
  }, []);

  const calculateAge = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return '';
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : '';
  };

  const getAgeBracket = (age) => {
    if (age <= 18) return '00-18 anos';
    if (age >= 19 && age <= 23) return '19-23 anos';
    if (age >= 24 && age <= 28) return '24-28 anos';
    if (age >= 29 && age <= 33) return '29-33 anos';
    if (age >= 34 && age <= 38) return '34-38 anos';
    if (age >= 39 && age <= 43) return '39-43 anos';
    if (age >= 44 && age <= 48) return '44-48 anos';
    if (age >= 49 && age <= 53) return '49-53 anos';
    if (age >= 54 && age <= 58) return '54-58 anos';
    if (age >= 59) return '59+ anos';
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome completo é obrigatório.";
    if (!formData.planoId.trim()) newErrors.planoId = "Plano de interesse é obrigatório.";
    if (!formData.email.trim()) {
        newErrors.email = "E-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Formato de e-mail inválido.";
    }
    if (!formData.telefone.trim()) {
        newErrors.telefone = "Telefone é obrigatório.";
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
        newErrors.telefone = "Telefone inválido.";
    }
    if (!validateCPF(formData.cpf)) {
        newErrors.cpf = "CPF inválido. Verifique o número.";
    }
    if (!formData.dataNascimento.trim()) {
        newErrors.dataNascimento = "Data de nascimento é obrigatória.";
    }

    if (!docs.rgCnh) newErrors.rgCnh = "RG ou CNH é obrigatório.";
    if (!docs.comprovanteEndereco) newErrors.comprovanteEndereco = "Comprovante de endereço é obrigatório.";
    return newErrors;
  };

  // --- Funções de Validação ---
  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf === '') return false;
    // Elimina CPFs invalidos conhecidos
    if (cpf.length !== 11 ||
      cpf === "00000000000" ||
      cpf === "11111111111" ||
      cpf === "22222222222" ||
      cpf === "33333333333" ||
      cpf === "44444444444" ||
      cpf === "55555555555" ||
      cpf === "66666666666" ||
      cpf === "77777777777" ||
      cpf === "88888888888" ||
      cpf === "99999999999")
      return false;
    // Valida 1o digito
    let add = 0;
    for (let i = 0; i < 9; i++)
      add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;
    // Valida 2o digito
    add = 0;
    for (let i = 0; i < 10; i++)
      add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;
    return true;
  };

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
    // Limpa o erro do campo ao ser alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setDocs(prev => ({ ...prev, [fieldName]: file }));
      // Limpa o erro do campo ao selecionar um arquivo
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return; // Para a submissão se houver erros
    }

    setLoading(true);

    // 1. Criar usuário no Auth (Email + CPF) - Apenas para Titulares
    let authUid = null;
    if (formData.tipo === 'Titular') {
        try {
            const authResponse = await fetch(`${CLOUD_FUNCTIONS_BASE}/createClientAuth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    cpf: formData.cpf,
                    nome: formData.nome
                })
            });
            const authData = await authResponse.json();
            if (authResponse.ok) authUid = authData.uid;
            else console.warn("Erro ao criar login do cliente:", authData.error);
        } catch (error) {
            console.error("Erro na criação do usuário Auth:", error);
        }
    }

    // Converte arquivos para base64 apenas no momento do envio
    const rgCnhBase64 = await convertToBase64(docs.rgCnh);
    const comprovanteEnderecoBase64 = await convertToBase64(docs.comprovanteEndereco);

    const payload = {
      USUARIO: formData.nome,
      CPF: formData.cpf,
      'DATA NASC': formData.dataNascimento,
      TELEFONE: formData.telefone,
      EMAIL: formData.email,
      planoId: formData.planoId,
      CONTRATO: formData.tipo,
      VENCIMENTO: formData.vencimento,
      // Campos ocultos/padrão
      MENSALIDADE: '0', 
      ValorAdesao: '0',
      STATUS: 'INCLUSÃO', // Entra como Inclusão para análise
      OBSERVACAO: 'Cadastro realizado via Link Externo',
      'ADESÃO': new Date().toLocaleDateString('pt-BR'),
      VENDEDOR: vendedorInfo.id,
      documentos: {
        rgCnh: rgCnhBase64,
        comprovanteEndereco: comprovanteEnderecoBase64
      },
      authUid: authUid,
      ...(formData.tipo === 'Dependente' && { titularId: formData.titularId })
    };

    const selectedPlan = planos.find(p => p.id === formData.planoId);
    if (selectedPlan) {
        payload.PLANO = `${selectedPlan.Plano} - ${selectedPlan.Acomodação}`;
        
        // Calcula MENSALIDADE baseado na idade
        const age = calculateAge(formData.dataNascimento);
        const ageBracket = getAgeBracket(age);
        if (ageBracket && selectedPlan[ageBracket]) {
             const priceStr = selectedPlan[ageBracket];
             const numericPrice = parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));
             if (!isNaN(numericPrice)) {
                 payload.MENSALIDADE = numericPrice.toFixed(2);
             }
        }
    }

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
          <img src={Logo} alt="Lavoro" style={styles.logo} />
          <div style={{ textAlign: 'center', color: '#28a745', marginTop: '20px' }}>
            <FaCheckCircle size={60} />
            <h2 style={{ marginTop: '20px' }}>Cadastro Recebido!</h2>
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
          <img src={Logo} alt="Lavoro" style={styles.logo} />
          <h2 style={{ margin: 0, color: '#333' }}>Ficha de Cadastro</h2>
          <p style={{ margin: '5px 0 0', color: '#666' }}>Preencha seus dados para prosseguir com a adesão.</p>
          {vendedorInfo.nome && (
            <div style={styles.vendedorBadge}>
              <small>Consultor: <strong>{vendedorInfo.nome}</strong></small>
            </div>
          )}
          {titularInfo.nome && (
            <div style={{ ...styles.vendedorBadge, marginLeft: '10px', backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
              <small>Titular Responsável: <strong>{titularInfo.nome}</strong></small>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}><FaUser /> Nome Completo</label>
            <input name="nome" value={formData.nome} onChange={handleChange} style={errors.nome ? styles.inputError : styles.input} placeholder="Seu nome completo" />
            {errors.nome && <small style={styles.errorText}>{errors.nome}</small>}
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaIdCard /> CPF</label>
              <input name="cpf" value={formData.cpf} onChange={handleChange} style={errors.cpf ? styles.inputError : styles.input} placeholder="000.000.000-00" maxLength="14" />
              {errors.cpf && <small style={styles.errorText}>{errors.cpf}</small>}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaCalendarAlt /> Data Nasc.</label>
              <input name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} style={errors.dataNascimento ? styles.inputError : styles.input} placeholder="DD/MM/AAAA" maxLength="10" />
              {errors.dataNascimento && <small style={styles.errorText}>{errors.dataNascimento}</small>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaPhone /> Telefone/WhatsApp</label>
              <input name="telefone" value={formData.telefone} onChange={handleChange} style={errors.telefone ? styles.inputError : styles.input} placeholder="(00) 00000-0000" maxLength="15" />
              {errors.telefone && <small style={styles.errorText}>{errors.telefone}</small>}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaEnvelope /> E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={errors.email ? styles.inputError : styles.input} placeholder="seu@email.com" />
              {errors.email && <small style={styles.errorText}>{errors.email}</small>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}><FaFileMedical /> Plano de Interesse</label>
              <select name="planoId" value={formData.planoId} onChange={handleChange} style={errors.planoId ? styles.inputError : styles.input}>
                <option value="">Selecione um plano...</option>
                {planos.map(p => <option key={p.id} value={p.id}>{p.Plano} - {p.Acomodação}</option>)}
              </select>
              {errors.planoId && <small style={styles.errorText}>{errors.planoId}</small>}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Tipo</label>
              <select name="tipo" value={formData.tipo} onChange={handleChange} style={styles.input} disabled={!!titularInfo.id}>
                <option value="Titular">Titular</option>
                {titularInfo.id && <option value="Dependente">Dependente</option>}
              </select>
            </div>
          </div>

          

          <div style={styles.divider}></div>
          <h4 style={{ margin: '0 0 15px 0', color: '#555' }}>Documentação (Fotos ou PDF)</h4>

          <div style={styles.fileInputContainer}>
            <label style={styles.label}>RG ou CNH</label>
            <div style={styles.fileWrapper}>
                <label htmlFor="rgCnh" style={styles.uploadBtn}>
                    <FaUpload /> {docs.rgCnh ? 'Alterar Arquivo' : 'Escolher Arquivo'}
                </label>
                <input id="rgCnh" type="file" onChange={(e) => handleFileChange(e, 'rgCnh')} style={{ display: 'none' }} />
            </div>
            {docs.rgCnh && <span style={styles.fileName}><FaCheckCircle style={{ marginRight: '5px' }} /> {docs.rgCnh.name}</span>}
            {errors.rgCnh && <small style={styles.errorText}>{errors.rgCnh}</small>}
          </div>

          <div style={styles.fileInputContainer}>
            <label style={styles.label}>Comprovante de Endereço</label>
            <div style={styles.fileWrapper}>
                <label htmlFor="compEnd" style={styles.uploadBtn}>
                    <FaUpload /> {docs.comprovanteEndereco ? 'Alterar Arquivo' : 'Escolher Arquivo'}
                </label>
                <input id="compEnd" type="file" onChange={(e) => handleFileChange(e, 'comprovanteEndereco')} style={{ display: 'none' }} />
            </div>
            {docs.comprovanteEndereco && <span style={styles.fileName}><FaCheckCircle style={{ marginRight: '5px' }} /> {docs.comprovanteEndereco.name}</span>}
            {errors.comprovanteEndereco && <small style={styles.errorText}>{errors.comprovanteEndereco}</small>}
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
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '650px',
    padding: '40px',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px'
  },
  logo: {
    height: '50px',
    marginBottom: '20px',
  },
  vendedorBadge: {
    display: 'inline-block',
    marginTop: '15px',
    padding: '6px 12px',
    backgroundColor: '#e3f2fd',
    color: '#0d47a1',
    borderRadius: '15px',
    fontSize: '0.9rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#444',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  input: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  },
  inputError: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #dc3545',
    fontSize: '1rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
  },
  divider: {
    height: '1px',
    backgroundColor: '#eee',
    margin: '15px 0'
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
    gap: '10px',
    padding: '12px 20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
    color: '#555',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  },
  submitBtn: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, transform 0.1s'
  },
  errorText: {
    color: '#dc3545',
    fontSize: '0.8rem',
    marginTop: '5px'
  },
  fileName: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '8px',
    fontSize: '0.9rem',
    color: '#28a745',
    fontWeight: '500',
    background: '#e9f7ef',
    padding: '8px 12px',
    borderRadius: '6px'
  }
};

export default CadastroExterno;
