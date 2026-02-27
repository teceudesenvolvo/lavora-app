import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaEnvelope, FaInbox, FaRegPaperPlane, FaExclamationTriangle, FaFileAlt, FaTrash, FaPlus, FaPaperclip, FaBold, FaItalic, FaListUl, FaTimes, FaSpinner } from 'react-icons/fa';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Email = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'sent', 'spam', 'drafts', 'trash', 'compose'
  const [emailsList, setEmailsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    html: '',
    fromName: '',
    attachments: []
  });
  const [sending, setSending] = useState(false);
  const editorRef = useRef(null);

  // URL base das Cloud Functions
  const CLOUD_FUNCTIONS_BASE = 'https://us-central1-lavoro-servicos-c10fd.cloudfunctions.net';
  const FIREBASE_DB_URL = 'https://lavoro-servicos-c10fd-default-rtdb.firebaseio.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setEmailData(prev => ({ ...prev, fromName: user.displayName || 'Usuário Lavoro' }));
        fetchEmails(user.uid, activeTab);
      } else {
        setCurrentUser(null);
        setEmailsList([]);
      }
    });
    return () => unsubscribe();
  }, [activeTab]);

  const fetchEmails = async (uid, folder) => {
    if (folder === 'compose') return;
    setLoading(true);
    setSelectedEmail(null);
    try {
        // Mapeamento de abas para caminhos no DB (ex: webmail/UID/sent)
        // Nota: Para 'inbox', como não temos servidor de entrada real, isso listará apenas se houver dados mockados ou inseridos manualmente.
        const response = await fetch(`${FIREBASE_DB_URL}/webmail/${uid}/${folder}.json`);
        const data = await response.json();
        if (data) {
            const lista = Object.keys(data).map(key => ({
                id: key,
                ...data[key]
            })).sort((a, b) => new Date(b.date) - new Date(a.date));
            setEmailsList(lista);
        } else {
            setEmailsList([]);
        }
    } catch (error) {
        console.error("Erro ao buscar emails:", error);
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prev => ({ ...prev, [name]: value }));
  };

  // Filtra e-mails com base na pesquisa
  const filteredEmails = emailsList.filter(email => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
        (email.subject && email.subject.toLowerCase().includes(term)) ||
        (email.from && email.from.toLowerCase().includes(term)) ||
        (email.to && email.to.toLowerCase().includes(term)) ||
        (email.fromName && email.fromName.toLowerCase().includes(term)) ||
        (email.preview && email.preview.toLowerCase().includes(term))
    );
  });

  // Função para o Editor de Texto Simples
  const execCmd = (command) => {
    document.execCommand(command, false, null);
    if (editorRef.current) {
        setEmailData(prev => ({ ...prev, html: editorRef.current.innerHTML }));
    }
  };

  const handleEditorInput = (e) => {
    const html = e.currentTarget.innerHTML;
    setEmailData(prev => ({ ...prev, html }));
  };

  // Função para Anexos
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];

    for (const file of files) {
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]); // Pega apenas o base64 sem o prefixo data:
            reader.readAsDataURL(file);
        });
        newAttachments.push({
            filename: file.name,
            content: base64
        });
    }

    setEmailData(prev => ({ ...prev, attachments: [...prev.attachments, ...newAttachments] }));
  };

  const removeAttachment = (index) => {
    setEmailData(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!emailData.html) {
        alert("Por favor, escreva uma mensagem.");
        return;
    }
    setSending(true);

    try {
      const response = await fetch(`${CLOUD_FUNCTIONS_BASE}/sendWebmailViaResend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ...emailData,
            fromEmail: currentUser?.email // Envia o e-mail do usuário logado
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('E-mail enviado com sucesso!');
        setEmailData({ to: '', subject: '', html: '', fromName: currentUser?.displayName || '', attachments: [] });
        if (editorRef.current) editorRef.current.innerHTML = '';
        setActiveTab('sent');
      } else {
        alert(`Erro ao enviar: ${data.error || 'Falha desconhecida'}`);
      }
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      alert('Erro de conexão ao enviar e-mail.');
    } finally {
      setSending(false);
    }
  };

  const handleViewEmail = (email) => {
      setSelectedEmail(email);
  };

  const handleDeleteEmail = async (email, e) => {
    if (e) e.stopPropagation();
    if (!currentUser) return;

    const isTrash = activeTab === 'trash';
    
    if (isTrash && !window.confirm("Tem certeza que deseja excluir permanentemente este e-mail?")) return;

    try {
        if (!isTrash) {
            // Mover para Lixeira (Copia para trash e adiciona metadados)
            const { id, ...emailData } = email;
            await fetch(`${FIREBASE_DB_URL}/webmail/${currentUser.uid}/trash.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...emailData, deletedAt: new Date().toISOString(), originalFolder: activeTab })
            });
        }

        // Deletar da pasta atual
        await fetch(`${FIREBASE_DB_URL}/webmail/${currentUser.uid}/${activeTab}/${email.id}.json`, {
            method: 'DELETE'
        });

        setEmailsList(prev => prev.filter(item => item.id !== email.id));
        if (selectedEmail && selectedEmail.id === email.id) {
            setSelectedEmail(null);
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir e-mail.");
    }
  };

  const renderContent = () => {
    if (activeTab === 'compose') {
        return (
          <form onSubmit={handleSend} className="settings-form">
            <fieldset className="settings-fieldset">
                <legend><FaEnvelope /> Nova Mensagem</legend>
                
                <div className="form-group">
                    <label>De:</label>
                    <input 
                        name="fromName" 
                        value={emailData.fromName} 
                        onChange={handleChange} 
                        disabled // Nome fixo do usuário logado, mas visível
                        style={{ backgroundColor: '#f9f9f9' }}
                    />
                </div>

                <div className="form-group">
                    <label>Para:</label>
                    <input 
                        required 
                        type="email" 
                        name="to" 
                        value={emailData.to} 
                        onChange={handleChange} 
                        placeholder="cliente@exemplo.com" 
                    />
                </div>

                <div className="form-group">
                    <label>Assunto</label>
                    <input 
                        required 
                        name="subject" 
                        value={emailData.subject} 
                        onChange={handleChange} 
                        placeholder="Assunto da mensagem" 
                    />
                </div>

                <div className="form-group">
                    <label>Mensagem</label>
                    
                    {/* Editor WYSIWYG Simples */}
                    <div className="editor-container" style={{ border: '1px solid #ccc', borderRadius: '5px', overflow: 'hidden' }}>
                        <div className="editor-toolbar" style={{ background: '#f0f0f0', padding: '8px', borderBottom: '1px solid #ccc', display: 'flex', gap: '5px' }}>
                            <button type="button" onClick={() => execCmd('bold')} title="Negrito" style={{ fontWeight: 'bold' }}><FaBold /></button>
                            <button type="button" onClick={() => execCmd('italic')} title="Itálico" style={{ fontStyle: 'italic' }}><FaItalic /></button>
                            <button type="button" onClick={() => execCmd('insertUnorderedList')} title="Lista"><FaListUl /></button>
                        </div>
                        <div 
                            className="editor-content"
                            contentEditable
                            ref={editorRef}
                            onInput={handleEditorInput}
                            style={{ minHeight: '200px', padding: '15px', outline: 'none' }}
                        ></div>
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', width: 'fit-content', padding: '8px 15px', background: '#e9ecef', borderRadius: '5px' }}>
                        <FaPaperclip /> Anexar Arquivos
                        <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                    </label>
                    
                    {emailData.attachments.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                            {emailData.attachments.map((att, index) => (
                                <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', background: '#f8f9fa', padding: '5px 10px', borderRadius: '4px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{att.filename}</span>
                                    <button type="button" onClick={() => removeAttachment(index)} style={{ border: 'none', background: 'none', color: 'red', cursor: 'pointer' }}><FaTimes /></button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </fieldset>

            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveTab('inbox')}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaPaperPlane /> {sending ? 'Enviando...' : 'Enviar E-mail'}
                </button>
            </div>
          </form>
        );
    }

    // Visualização de Detalhes do Email
    if (selectedEmail) {
        return (
            <div className="email-detail">
                <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <button onClick={() => setSelectedEmail(null)} className="btn btn-secondary" style={{ marginBottom: '15px', fontSize: '0.8rem' }}>&larr; Voltar</button>
                        <h2 style={{ margin: '0 0 10px 0' }}>{selectedEmail.subject}</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '0.9rem' }}>
                            <span><strong>De:</strong> {selectedEmail.fromName || selectedEmail.from || 'Desconhecido'}</span>
                            <span>{new Date(selectedEmail.date).toLocaleString()}</span>
                        </div>
                        <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                            <strong>Para:</strong> {selectedEmail.to}
                        </div>
                    </div>
                    <button 
                        onClick={(e) => handleDeleteEmail(selectedEmail, e)} 
                        className="btn btn-danger"
                        title={activeTab === 'trash' ? "Excluir permanentemente" : "Mover para lixeira"}
                        style={{ marginTop: '35px' }}
                    >
                        <FaTrash />
                    </button>
                </div>
                <div className="email-body" dangerouslySetInnerHTML={{ __html: selectedEmail.body }} style={{ lineHeight: '1.6', overflowWrap: 'break-word' }} />
                
                {selectedEmail.hasAttachments && (
                    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px', paddingBottom: '20px' }}>
                        <strong><FaPaperclip /> Anexos disponíveis</strong>
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
                            {selectedEmail.attachments && selectedEmail.attachments.map((att, index) => (
                                <li key={index} style={{ marginBottom: '8px' }}>
                                    <a 
                                        href={`data:application/octet-stream;base64,${att.content}`} 
                                        download={att.filename}
                                        style={{ color: '#007bff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: '#f8f9fa', padding: '8px', borderRadius: '5px', width: 'fit-content' }}
                                    >
                                        <FaFileAlt /> {att.filename} <span style={{ fontSize: '0.8rem', color: '#666' }}>(Baixar)</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Listagem de Emails
    return (
        <div className="email-list">
            <div className="email-search" style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                <input 
                    type="text" 
                    placeholder="Pesquisar e-mails..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>
            {loading ? (
                <div className="empty-state"><FaSpinner className="icon-spin" /> Carregando...</div>
            ) : filteredEmails.length === 0 ? (
                <div className="empty-state"><p>Nenhum e-mail encontrado.</p></div>
            ) : (
                <ul className="email-list-ul">
                    {filteredEmails.map(email => (
                        <li key={email.id} className="email-list-item" onClick={() => handleViewEmail(email)}>
                            <div className="email-avatar">
                                {(email.fromName || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="email-info">
                                <div className="email-header">
                                    <span className="email-sender">{email.fromName || email.from || 'Desconhecido'}</span>
                                    <span className="email-date">{new Date(email.date).toLocaleDateString()}</span>
                                </div>
                                <div className="email-subject">{email.subject}</div>
                                <div className="email-preview">{email.preview}</div>
                            </div>
                            <button 
                                className="btn-delete-list"
                                onClick={(e) => handleDeleteEmail(email, e)}
                                title={activeTab === 'trash' ? "Excluir permanentemente" : "Mover para lixeira"}
                            >
                                <FaTrash />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
  };

  return (
    <div className="profile-section">
      <h2 className="faturas-section-title">Email Corporativo</h2>
      <p className="cotacao-subtitle">Envie e-mails profissionais através do domínio @lavoroservicos.com.br</p>

      <div className="email-container" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        {/* Sidebar do Email */}
        <div className="email-sidebar" style={{ width: '200px', flexShrink: 0 }}>
            <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                onClick={() => setActiveTab('compose')}
            >
                <FaPlus /> Nova Mensagem
            </button>
            
            <nav className="email-nav">
                <button className={`email-nav-item ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
                    <FaInbox /> Caixa de Entrada
                </button>
                <button className={`email-nav-item ${activeTab === 'sent' ? 'active' : ''}`} onClick={() => setActiveTab('sent')}>
                    <FaRegPaperPlane /> Enviados
                </button>
                <button className={`email-nav-item ${activeTab === 'spam' ? 'active' : ''}`} onClick={() => setActiveTab('spam')}>
                    <FaExclamationTriangle /> Spam
                </button>
                <button className={`email-nav-item ${activeTab === 'drafts' ? 'active' : ''}`} onClick={() => setActiveTab('drafts')}>
                    <FaFileAlt /> Rascunhos
                </button>
                <button className={`email-nav-item ${activeTab === 'trash' ? 'active' : ''}`} onClick={() => setActiveTab('trash')}>
                    <FaTrash /> Lixeira
                </button>
            </nav>
        </div>

        {/* Conteúdo Principal */}
        <div className="email-content" style={{ flex: 1, background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            {renderContent()}
        </div>
      </div>
      
      <style>{`
        .email-nav-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 10px 15px;
            background: none;
            border: none;
            text-align: left;
            cursor: pointer;
            color: #555;
            border-radius: 5px;
            margin-bottom: 5px;
            font-size: 0.95rem;
        }
        .email-nav-item:hover {
            background-color: #f0f0f0;
            color: #333;
        }
        .email-nav-item.active {
            background-color: #e3f2fd;
            color: #007bff;
            font-weight: bold;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        .editor-toolbar button {
            border: 1px solid #ddd;
            background: #fff;
            cursor: pointer;
            padding: 5px 10px;
            border-radius: 3px;
        }
        .editor-toolbar button:hover {
            background: #e9ecef;
        }
        .email-list-ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .email-list-item {
            display: flex;
            gap: 15px;
            padding: 15px;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
        }
        .email-list-item:hover {
            background-color: #f9f9f9;
        }
        .email-avatar {
            width: 40px;
            height: 40px;
            background-color: #007bff;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        .email-info {
            flex: 1;
            overflow: hidden;
        }
        .email-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
        }
        .email-sender {
            font-weight: bold;
            color: #333;
        }
        .email-date {
            font-size: 0.8rem;
            color: #999;
        }
        .email-subject {
            font-weight: 500;
            color: #555;
            margin-bottom: 3px;
        }
        .email-preview {
            font-size: 0.9rem;
            color: #888;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .btn-delete-list {
            background: none;
            border: none;
            color: #dc3545;
            cursor: pointer;
            padding: 10px;
            opacity: 0.6;
            transition: opacity 0.2s;
        }
        .btn-delete-list:hover {
            opacity: 1;
        }
        .btn-danger {
            background-color: #dc3545;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
        }
        .btn-danger:hover {
            background-color: #c82333;
        }
      `}</style>
    </div>
  );
};

export default Email;