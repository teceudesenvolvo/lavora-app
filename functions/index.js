const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const PostalMime = require("postal-mime");

// Configuração do Transporter de E-mail (Exemplo com Gmail)
// IMPORTANTE: Para Gmail, use uma "Senha de App" gerada em sua conta Google.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "blutecnologiasbr@gmail.com", // SUBSTITUA PELO SEU E-MAIL
    pass: "tbqx ljgd lhot vjek"     // SUBSTITUA PELA SENHA DE APP
  }
});

admin.initializeApp();

// --- CONFIGURAÇÕES ---
// Em produção, use: firebase functions:config:set pagarme.key="sk_..." whatsapp.token="EAAG..."
// Para teste local, você pode substituir as strings abaixo.
// IMPORTANTE: Substitua pelos seus tokens reais obtidos em https://developers.facebook.com/apps/
const PAGARME_API_KEY = process.env.PAGARME_KEY || "sk_b411329ad76d4efe9c918d0dacf5342e";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAG..."; // Cole seu Token Permanente ou Temporário aqui
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "1234567890"; // Cole o ID do número de telefone aqui

/**
 * Cria uma cobrança PIX com Split na Pagar.me (API v5)
 * Documentação: https://docs.pagar.me/reference/criar-pedido
 */
exports.createPagarmeSplitOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
      }

      const { amount, description, customer, split_rules, payment_method, metadata } = req.body;
      const method = payment_method || 'pix';

      // Validação do CPF/CNPJ do cliente, obrigatório para split
      const customerDoc = customer.document ? String(customer.document).replace(/\D/g, '') : '';
      if (!customerDoc || (customerDoc.length !== 11 && customerDoc.length !== 14)) {
        return res.status(400).json({ error: "Documento (CPF/CNPJ) do cliente é inválido ou não foi fornecido e é obrigatório para gerar cobranças." });
      }

      // Formata as regras de split para o padrão Pagar.me V5
      // Alterado para 'flat' (centavos) para evitar erros de soma de porcentagem (ex: 96.2 + 3.8 = 100)
      let formattedSplit = [];
      if (split_rules && split_rules.length > 0) {
        const totalAmount = parseInt(amount);
        let currentSum = 0;

        formattedSplit = split_rules.map(rule => {
          const ruleAmount = Math.floor(totalAmount * (rule.percentage / 100));
          currentSum += ruleAmount;
          return {
            recipient_id: rule.recipient_id,
            amount: ruleAmount,
            type: "flat",
            options: {
              charge_processing_fee: rule.charge_processing_fee,
              liable: rule.liable,
              charge_remainder_fee: rule.liable
            }
          };
        });

        // Ajuste de centavos (remainder) para garantir que a soma bata com o total
        const remainder = totalAmount - currentSum;
        if (remainder > 0) {
          const liableIndex = formattedSplit.findIndex(r => r.options.liable);
          if (liableIndex >= 0) {
            formattedSplit[liableIndex].amount += remainder;
          } else {
            formattedSplit[0].amount += remainder;
          }
        }
      }

      const paymentData = {
        payment_method: method,
        split: formattedSplit
      };

      if (method === 'pix') {
        paymentData.pix = { expires_in: 86400 }; // 24h
      } else if (method === 'boleto') {
        paymentData.boleto = {
            instructions: "Pagar até o vencimento",
            due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Vencimento em 3 dias
            document_number: "123"
        };
      }

      // Análise robusta do telefone para evitar erros na API da Pagar.me
      const rawPhone = String(customer.phone || '').replace(/\D/g, '');
      let areaCode = '11';
      let number = '999999999'; // Fallback

      if (rawPhone.startsWith('55') && rawPhone.length >= 12) {
        // Formato com código de país: 5511999999999
        areaCode = rawPhone.substring(2, 4);
        number = rawPhone.substring(4);
      } else if (rawPhone.length >= 10) {
        // Formato sem código de país: 11999999999 ou 1188888888
        areaCode = rawPhone.substring(0, 2);
        number = rawPhone.substring(2);
      }

      // Monta o objeto do pedido conforme a API v5 da Pagar.me
      const orderData = {
        customer: {
          name: customer.name,
          email: customer.email || "cliente@lavoro.com.br",
          type: "individual",
          document: customerDoc,
          phones: {
            mobile_phone: {
              country_code: "55",
              area_code: areaCode,
              number: number
            }
          }
        },
        metadata: metadata || {},
        items: [
         {
            amount: amount,
            description: description,
            quantity: 1,
            code: "REF-123"
          }
        ],
        payments: [
          paymentData
        ]
      };

      // Chamada à API da Pagar.me
      const response = await axios.post("https://api.pagar.me/core/v5/orders", orderData, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(PAGARME_API_KEY + ":").toString("base64")
        }
      });

      // Extrai o QR Code e o Código Copia e Cola da resposta
      const charge = response.data.charges[0];
      const pixTransaction = charge.last_transaction;

      const result = {
        id: response.data.id,
        status: charge.status
      };

      if (method === 'pix') {
        result.pixCopyPaste = pixTransaction.qr_code;
        result.pixQrCodeUrl = pixTransaction.qr_code_url;
      } else if (method === 'boleto') {
        result.boletoLine = pixTransaction.line;
        result.boletoUrl = pixTransaction.pdf || pixTransaction.url;
      }

      res.status(200).json(result);

    } catch (error) {
     const errorData = error.response ? error.response.data : error.message;
      console.error("Erro Pagar.me:", errorData);
      res.status(500).json({ 
        error: "Erro ao processar pagamento", 
        details: errorData,
        raw: error
      });
    }
  });
});

/**
 * Webhook para receber notificações da Pagar.me e atualizar o Firebase
 */
exports.pagarmeWebhook = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { type, data } = req.body;
      console.log("Webhook received:", type, data?.id);

      // Verifica se é um evento de pedido pago
      if (type === 'order.paid') {
        const { metadata, status, charges } = data;
        
        // Se o status for pago e tivermos os metadados do nosso sistema
        if (status === 'paid' && metadata && metadata.firebaseId && metadata.type) {
           const db = admin.database();
           
           // Configura fuso horário para Brasil (evita datas erradas por UTC)
           const dateOptions = { timeZone: 'America/Sao_Paulo' };
           const paymentDate = new Date().toLocaleDateString('pt-BR', dateOptions);
           
           // Lógica melhorada: Procura a cobrança que está efetivamente paga
           const paidCharge = charges ? charges.find(c => c.status === 'paid') : null;
           const targetCharge = paidCharge || (charges && charges.length > 0 ? charges[0] : null);
           const paymentMethod = targetCharge ? targetCharge.payment_method : 'API';
           const methodLabel = paymentMethod === 'pix' ? 'Pix' : (paymentMethod === 'boleto' ? 'Boleto' : 'Cartão');
           
           console.log(`Webhook Order Paid: ${data.id}, Method Detected: ${paymentMethod} -> Label: ${methodLabel}`);

           if (metadata.type === 'assinatura') {
             // Lógica para Assinatura: Adiciona ao histórico de pagamentos
             const ref = db.ref(`clientes/${metadata.firebaseId}`);
             const snapshot = await ref.once('value');
             const clientData = snapshot.val();
             
             if (clientData) {
               let currentHistory = clientData.dataPagamento || [];
               if (!Array.isArray(currentHistory)) {
                 currentHistory = typeof currentHistory === 'object' ? Object.values(currentHistory) : [];
               }
               
               // Usa o mês atual como referência
               const monthName = new Date().toLocaleString('pt-BR', { ...dateOptions, month: 'long' });
               const paymentEntry = `${monthName}: ${paymentDate} - ${methodLabel}`;
               
               // Evita duplicidade simples verificando se já existe entrada com mesmo mês e data
               const alreadyPaid = currentHistory.some(h => h.includes(monthName) && h.includes(paymentDate));
               
               if (!alreadyPaid) {
                 currentHistory.push(paymentEntry);
                 await ref.update({ dataPagamento: currentHistory });
                 console.log(`Cliente ${metadata.firebaseId} atualizado via webhook.`);
               }
             }

           } else if (metadata.type === 'avulsa') {
             // Lógica para Cobrança Avulsa: Atualiza status
             const ref = db.ref(`cobrancas/${metadata.firebaseId}`);
             await ref.update({
               status: 'Pago',
               dataPagamento: paymentDate,
               formaPagamento: methodLabel
             });
             console.log(`Cobrança ${metadata.firebaseId} atualizada via webhook.`);
           }
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("Erro no Webhook:", error);
      res.status(500).send("Erro interno");
    }
  });
});

/**
 * Convida um novo usuário: Cria no Auth e gera link de definição de senha
 */
exports.inviteUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { email, nome, cargo } = req.body;
      
      // Verifica se usuário já existe
      try {
          await admin.auth().getUserByEmail(email);
          return res.status(400).json({ error: "Usuário já existe com este e-mail." });
      } catch (e) {
          if (e.code !== 'auth/user-not-found') throw e;
      }

      // Cria usuário no Auth
      const userRecord = await admin.auth().createUser({
        email,
        displayName: nome,
        emailVerified: true
      });

      // Gera link de redefinição de senha (funciona como convite para definir senha)
      const link = await admin.auth().generatePasswordResetLink(email);

      // Envia o e-mail real
      const mailOptions = {
        from: '"Lavoro Admin" <seu-email@gmail.com>',
        to: email,
        subject: 'Convite para acessar o Sistema Lavoro',
        html: `
          <h3>Olá, ${nome}!</h3>
          <p>Você foi convidado para fazer parte da equipe Lavoro como <strong>${cargo}</strong>.</p>
          <p>Para definir sua senha e acessar o sistema, clique no link abaixo:</p>
          <a href="${link}">Definir Senha de Acesso</a>
          <p><small>Se o botão não funcionar, copie e cole: ${link}</small></p>
        `
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Usuário criado e convite gerado", uid: userRecord.uid });

    } catch (error) {
      console.error("Erro ao convidar usuário:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Exclui um usuário do Firebase Auth
 */
exports.deleteUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { uid } = req.body;
      if (!uid) return res.status(400).json({ error: "UID is required" });

      await admin.auth().deleteUser(uid);
      res.status(200).json({ message: "Usuário excluído do Auth com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir usuário Auth:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Verifica status de um pedido na Pagar.me (API v5)
 */
exports.checkPagarmeOrderStatus = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ error: "orderId is required" });

      const response = await axios.get(`https://api.pagar.me/core/v5/orders/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic " + Buffer.from(PAGARME_API_KEY + ":").toString("base64")
        }
      });

      const charges = response.data.charges || [];
      
      // Lógica melhorada: Procura a cobrança que está efetivamente paga
      const paidCharge = charges.find(c => c.status === 'paid');
      const targetCharge = paidCharge || (charges.length > 0 ? charges[charges.length - 1] : null);
      const payment_method = targetCharge ? targetCharge.payment_method : 'API';

      console.log(`Check Status Order ${orderId}: Status=${response.data.status}, Method=${payment_method}`);
      
      res.status(200).json({ 
        status: response.data.status,
        payment_method: payment_method
      });
    } catch (error) {
      console.error("Erro Pagar.me Check:", error.response?.data || error.message);
      res.status(500).json({ error: "Erro ao verificar status", details: error.response?.data });
    }
  });
});


/**
 * Envia mensagem via WhatsApp Business API (Meta)
 * Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */
exports.sendWhatsAppMessage = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { phone, message } = req.body;

      const response = await axios.post(
        `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message }
        },
        {
          headers: {
            "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
            "Content-Type": "application/json"
          }
        }
      );

      res.status(200).json(response.data);

    } catch (error) {
      console.error("Erro WhatsApp:", error.response?.data || error.message);
      // Retorna sucesso falso mas não quebra a aplicação se falhar o envio
      res.status(500).json({ error: "Falha no envio", details: error.response?.data });
    }
  });
});

/**
 * Cria uma conta de Webmail (usuário no Auth + perfil no Firestore)
 * Força o domínio @lavoroservicos.com.br
 */
exports.createWebmailAccount = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
      }

      const { username, password, name } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username e password são obrigatórios." });
      }

      const fullEmail = `${username}@lavoroservicos.com.br`;
      let userRecord;

      // 1. Criar ou recuperar usuário no Authentication
      try {
        userRecord = await admin.auth().createUser({
          email: fullEmail,
          password: password,
          displayName: name || username,
        });
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
           console.log(`Usuário ${fullEmail} já existe. Atualizando senha...`);
           userRecord = await admin.auth().getUserByEmail(fullEmail);
           await admin.auth().updateUser(userRecord.uid, {
               password: password,
               displayName: name || username
           });
        } else {
           throw authError;
        }
      }

      // 2. Criar perfil no Realtime Database (substituindo Firestore para evitar erros de API)
      await admin.database().ref(`webmail_users/${userRecord.uid}`).set({
        username: username,
        email: fullEmail,
        displayName: name || username,
        createdAt: admin.database.ServerValue.TIMESTAMP,
        storageUsed: 0,
      });

      res.status(200).json({ 
        message: "Conta criada com sucesso!", 
        user: { uid: userRecord.uid, email: fullEmail } 
      });

    } catch (error) {
      console.error("Erro ao criar conta de webmail:", error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Envia e-mail usando a API do Resend
 * Requer configuração da chave de API do Resend
 */
exports.sendWebmailViaResend = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
      }

      const { to, subject, html, fromName, attachments, fromEmail } = req.body;
      const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_8qQJWKFf_KhcZeZP61DMxQVbMDUhrJjQJ"; // Configure sua chave aqui ou nas variáveis de ambiente

      // Envia via Axios para a API do Resend
      const response = await axios.post(
        "https://api.resend.com/emails",
        {
          from: `${fromName || 'Webmail'} <${fromEmail || 'nao-responda@lavoroservicos.com.br'}>`, // Domínio deve estar verificado no Resend
          to: [to],
          subject: subject,
          html: html,
          attachments: attachments // Array de anexos { filename, content }
        },
        {
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      // --- LÓGICA DE PERSISTÊNCIA (Webmail) ---
      const db = admin.database();
      const timestamp = new Date().toISOString();
      const previewText = html ? html.replace(/<[^>]+>/g, '').substring(0, 50) + '...' : '';

      // 1. Salvar na pasta "Enviados" do Remetente
      if (fromEmail) {
        try {
           const senderUser = await admin.auth().getUserByEmail(fromEmail);
           if (senderUser) {
             await db.ref(`webmail/${senderUser.uid}/sent`).push({
               to,
               subject,
               preview: previewText,
               body: html || `<p><i>(Email sem conteúdo visível)</i></p>`,
               date: timestamp,
               fromName: fromName || fromEmail,
               hasAttachments: !!(attachments && attachments.length),
               attachments: attachments || [] // Salva os anexos (Base64) no banco
             });
             console.log(`Email salvo em Enviados para: ${fromEmail}`);
           }
        } catch (err) {
           console.warn("Erro ao salvar em Enviados:", err.message);
        }
      } else {
         console.warn("fromEmail não fornecido. O e-mail não foi salvo na pasta Enviados.");
      }

      // 2. Simular Entrega Interna (Inbox) se o destinatário for do mesmo domínio
      // Isso permite que usuários do sistema recebam e-mails uns dos outros na Caixa de Entrada
      if (to && to.includes('@lavoroservicos.com.br')) {
         try {
           const recipientUser = await admin.auth().getUserByEmail(to);
           if (recipientUser) {
             await db.ref(`webmail/${recipientUser.uid}/inbox`).push({
               from: fromEmail || 'nao-responda@lavoroservicos.com.br',
               fromName: fromName || fromEmail,
               subject,
               preview: previewText,
               body: html || `<p><i>(Email sem conteúdo visível)</i></p>`,
               date: timestamp,
               hasAttachments: !!(attachments && attachments.length),
               read: false,
               attachments: attachments || [] // Salva os anexos (Base64) no banco
             });
             console.log(`Entrega interna realizada para: ${to}`);
           }
         } catch (err) {
            console.warn("Erro ao entregar internamente:", err.message);
         }
      }
      // -----------------------------------------

      res.status(200).json(response.data);

    } catch (error) {
      console.error("Erro ao enviar via Resend:", error.response?.data || error.message);
      res.status(500).json({ error: "Falha ao enviar e-mail", details: error.response?.data });
    }
  });
});

/**
 * Recebe e-mails processados pelo Cloudflare Worker (Inbound)
 * Substitui o antigo webhook do Resend.
 * Espera um JSON com { from, to, subject, html, text, attachments }
 */
exports.handleInboundEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
      }

      // --- VERIFICAÇÃO DE SEGURANÇA ---
      // Defina a mesma chave no Cloudflare Worker (variável de ambiente AUTH_KEY)
      const INBOUND_AUTH_KEY = process.env.INBOUND_AUTH_KEY || "lavoro-secret-2026";
      const receivedKey = req.headers['x-auth-key'];

      if (receivedKey !== INBOUND_AUTH_KEY) {
        console.warn("Tentativa de acesso não autorizado ao webhook de e-mail.");
        return res.status(403).send("Acesso negado");
      }

      // Recebe o novo payload com o MIME bruto
      const { from, to, subject, content } = req.body;
      if (!content) {
        return res.status(400).send("Payload inválido: campo 'content' (MIME) ausente.");
      }

      // Faz o parse do conteúdo MIME bruto
      const parser = new PostalMime();
      const parsedEmail = await parser.parse(content);

      const html = parsedEmail.html;
      const text = parsedEmail.text;

      // Processa anexos para o formato Base64, que o frontend espera
      const attachments = [];
      if (parsedEmail.attachments && parsedEmail.attachments.length > 0) {
        for (const att of parsedEmail.attachments) {
          attachments.push({
            filename: att.filename,
            mimeType: att.mimeType,
            content: att.content ? Buffer.from(att.content).toString('base64') : null
          });
        }
      }

      console.log(`Inbound Email recebido de: ${from} | Assunto: ${subject}`);

      // Normaliza destinatários (pode ser string ou array)
      const recipientsList = Array.isArray(to) ? to : (to ? [to] : []);

      if (recipientsList.length === 0) {
          console.warn("E-mail sem destinatários (campo 'to' vazio ou inválido).");
          return res.status(200).send("Sem destinatários processáveis");
      }

      const db = admin.database();
      const processPromises = recipientsList.map(async (recipientStr) => {
          // Extrai apenas o e-mail (remove o nome se houver)
          const emailMatch = recipientStr.match(/([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
          const emailAddress = emailMatch ? emailMatch[0].toLowerCase() : null;

          console.log(`Processando destinatário: ${recipientStr} -> Extraído: ${emailAddress}`);

          if (emailAddress && emailAddress.includes('@lavoroservicos.com.br')) {
              try {
                  const userRecord = await admin.auth().getUserByEmail(emailAddress);
                  console.log(`Usuário encontrado no Auth: ${userRecord.uid}`);
                  
                  // Extrai nome do remetente (Ex: "Nome <email@...>" -> "Nome")
                  let senderName = from;
                  if (from && from.includes('<')) {
                      const match = from.match(/^(.*)<(.*)>$/);
                      if (match) senderName = match[1].trim().replace(/^"|"$/g, '');
                  }
                  
                  // Salva na Inbox do usuário
                  await db.ref(`webmail/${userRecord.uid}/inbox`).push({
                      from: from,
                      fromName: senderName,
                      subject: subject,
                      // Gera o preview a partir do HTML (se existir), senão do texto, para maior consistência.
                      preview: ((html ? html.replace(/<[^>]+>/g, '') : text) || '').substring(0, 80) + '...',
                      // Prioriza o corpo HTML. Se não houver, usa o texto (convertendo quebras de linha).
                      body: html || (text ? text.replace(/\n/g, '<br>') : `<p><em>(Mensagem sem conteúdo de texto. Assunto: ${subject || 'Sem assunto'})</em></p>`),
                      date: new Date().toISOString(),
                      read: false,
                      external: true,
                      hasAttachments: !!(attachments && attachments.length),
                      attachments: attachments || []
                  });
                  console.log(`SUCESSO: Email salvo na inbox de ${emailAddress}`);
              } catch (err) {
                  console.warn(`FALHA: Usuário não encontrado ou erro ao salvar para ${emailAddress}:`, err.message);
              }
          } else {
              console.log(`IGNORADO: Email ${emailAddress} não pertence ao domínio @lavoroservicos.com.br`);
          }
      });

      await Promise.all(processPromises);
      res.status(200).json({ received: true });

    } catch (error) {
      console.error("ERRO FATAL no Inbound Email:", error);
      res.status(500).send("Erro interno");
    }
  });
});

/**
 * Exemplo de função que redireciona o usuário se já estiver logado.
 * Ideal para rotas que devem ser acessadas apenas por usuários não autenticados (ex: login, signup).
 *
 * Para usar esta função, o cliente (frontend) deve enviar o token de ID do Firebase Auth
 * no cabeçalho 'Authorization' como 'Bearer <idToken>'.
 */
exports.redirectIfLoggedIn = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // 1. Obter o token de autenticação do cabeçalho da requisição
      const idToken = req.headers.authorization?.split('Bearer ')[1];

      if (idToken) {
        try {
          // 2. Verificar o token de autenticação usando o Admin SDK
          const decodedToken = await admin.auth().verifyIdToken(idToken);
          // Se o token for válido, o usuário está logado. Redirecionar.
          console.log(`Usuário logado (${decodedToken.uid}) tentou acessar rota restrita. Redirecionando.`);
          // 3. Redirecionar para uma rota de usuário logado (ex: dashboard)
          return res.redirect(302, '/dashboard'); // Substitua por sua URL de dashboard real
        } catch (error) {
          // Token inválido ou expirado. Tratar como usuário não autenticado.
          console.log("Token inválido ou expirado, prosseguindo como usuário não autenticado.");
        }
      }

      // Se não há token ou o token é inválido/expirado, o usuário não está logado.
      // Prosseguir com a lógica para usuários não autenticados.
      res.status(200).send("Bem-vindo! Por favor, faça login ou registre-se.");
    } catch (error) {
      console.error("Erro na função redirectIfLoggedIn:", error);
      res.status(500).send("Erro interno do servidor.");
    }
  });
});

/**
 * Helper para criar pedido na Pagar.me (Interno)
 */
async function createPagarmeOrderInternal(customer, amount, method, description) {
  // Regras de Split (Mesmas do Frontend)
  const split_rules = [
    { recipient_id: "re_cmm1zy49o2zhm0l9t0ispccsx", percentage: 96.2, liable: true, charge_processing_fee: false },
    { recipient_id: "re_cmm204du72zq50l9t9owfdeni", percentage: 3.8, liable: false, charge_processing_fee: true }
  ];

  // Cálculo do Split (Centavos)
  let formattedSplit = [];
  const totalAmount = parseInt(amount);
  let currentSum = 0;

  formattedSplit = split_rules.map(rule => {
    const ruleAmount = Math.floor(totalAmount * (rule.percentage / 100));
    currentSum += ruleAmount;
    return {
      recipient_id: rule.recipient_id,
      amount: ruleAmount,
      type: "flat",
      options: {
        charge_processing_fee: rule.charge_processing_fee,
        liable: rule.liable,
        charge_remainder_fee: rule.liable
      }
    };
  });

  const remainder = totalAmount - currentSum;
  if (remainder > 0) {
    const liableIndex = formattedSplit.findIndex(r => r.options.liable);
    if (liableIndex >= 0) formattedSplit[liableIndex].amount += remainder;
    else formattedSplit[0].amount += remainder;
  }

  const paymentData = {
    payment_method: method,
    split: formattedSplit
  };

  if (method === 'pix') {
    paymentData.pix = { expires_in: 259200 }; // 3 dias
  } else if (method === 'boleto') {
    paymentData.boleto = {
        instructions: "Pagar até o vencimento",
        due_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        document_number: "123"
    };
  }

  const orderData = {
    customer: customer,
    items: [{ amount: totalAmount, description: description, quantity: 1, code: "REF-BULK" }],
    payments: [paymentData]
  };

  const response = await axios.post("https://api.pagar.me/core/v5/orders", orderData, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(PAGARME_API_KEY + ":").toString("base64")
    }
  });

  return response.data;
}

/**
 * Envia e-mails de cobrança em massa para todos os clientes ativos
 */
exports.sendBulkBillingEmails = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
      }

      // Busca todos os clientes
      const snapshot = await admin.database().ref('clientes').once('value');
      const clientes = snapshot.val();

      if (!clientes) {
        return res.status(200).json({ message: "Nenhum cliente encontrado." });
      }

      const emailPromises = [];
      let count = 0;

      // Configuração de data para verificação de pagamento
      const dateOptions = { timeZone: 'America/Sao_Paulo' };
      const today = new Date();
      const currentMonthName = today.toLocaleString('pt-BR', { ...dateOptions, month: 'long' });
      const currentYear = today.getFullYear();
      
      const normalizeStr = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
      const targetMonth = normalizeStr(currentMonthName);

      Object.values(clientes).forEach(cliente => {
        // Verifica se tem email e se está ativo
        if (cliente.EMAIL && cliente.STATUS === 'Ativo') {
           
           // Verifica se já pagou neste mês
           let alreadyPaid = false;
           if (cliente.dataPagamento) {
             const history = Array.isArray(cliente.dataPagamento) ? cliente.dataPagamento : Object.values(cliente.dataPagamento);
             alreadyPaid = history.some(entry => {
                if (typeof entry !== 'string') return false;
                const normalizedEntry = normalizeStr(entry);
                // Verifica se começa com o mês atual E contém o ano atual (para evitar falsos positivos de anos anteriores)
                return normalizedEntry.startsWith(targetMonth) && entry.includes(String(currentYear));
             });
           }

           // Se NÃO pagou, envia o e-mail
           if (!alreadyPaid) {
             // Prepara dados para geração de cobrança
             const rawPhone = String(cliente.TELEFONE || '').replace(/\D/g, '');
             let areaCode = '11';
             let number = '999999999';
             if (rawPhone.startsWith('55') && rawPhone.length >= 12) {
                areaCode = rawPhone.substring(2, 4);
                number = rawPhone.substring(4);
             } else if (rawPhone.length >= 10) {
                areaCode = rawPhone.substring(0, 2);
                number = rawPhone.substring(2);
             }

             const customerData = {
                name: cliente.USUARIO || "Cliente Lavoro",
                email: cliente.EMAIL,
                type: "individual",
                document: String(cliente.CPF || '00000000000').replace(/\D/g, ''),
                phones: { mobile_phone: { country_code: "55", area_code: areaCode, number: number } }
             };

             // Valor em centavos
             const valorString = String(cliente.MENSALIDADE || '0').replace('R$', '').trim().replace('.', '').replace(',', '.');
             const amount = Math.round(parseFloat(valorString) * 100);
             const description = `Mensalidade ${currentMonthName}/${currentYear}`;

             // Gera Boleto e PIX
             // Nota: Isso gera 2 pedidos separados na Pagar.me para o mesmo mês.
             const promise = (async () => {
                try {
                    const boletoOrder = await createPagarmeOrderInternal(customerData, amount, 'boleto', description);
                    const pixOrder = await createPagarmeOrderInternal(customerData, amount, 'pix', description);

                    const boletoUrl = boletoOrder.charges[0].last_transaction.pdf || boletoOrder.charges[0].last_transaction.url;
                    const pixCode = pixOrder.charges[0].last_transaction.qr_code;

                    const mailOptions = {
                        from: '"Lavoro Financeiro" <blutecnologiasbr@gmail.com>',
                        to: cliente.EMAIL,
                        subject: `Fatura Lavoro - ${currentMonthName}/${currentYear}`,
                        html: `
                          <div style="font-family: Arial, sans-serif; color: #333;">
                            <h3>Prezado(a) ${cliente.USUARIO || 'Cliente'},</h3>
                            <p>Segue abaixo os dados para pagamento da sua mensalidade referente a <strong>${currentMonthName}</strong>.</p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Opção 1: PIX Copia e Cola</strong></p>
                                <p style="word-break: break-all; font-family: monospace; background: #fff; padding: 10px; border: 1px solid #ddd;">${pixCode}</p>
                                <p><small>Copie o código acima e cole no seu aplicativo bancário.</small></p>
                            </div>

                            <p><strong>Opção 2: Boleto Bancário</strong></p>
                            <p>O boleto para pagamento encontra-se em anexo neste e-mail.</p>

                            <br>
                            <p>Caso já tenha efetuado o pagamento, por favor, desconsidere este aviso.</p>
                            <p>Atenciosamente,<br><strong>Departamento Financeiro - Grupo Lavoro</strong></p>
                          </div>
                        `,
                        attachments: [
                            { filename: `Fatura_Lavoro_${currentMonthName}.pdf`, path: boletoUrl }
                        ]
                    };
                    await transporter.sendMail(mailOptions);
                    return true;
                } catch (err) {
                    console.error(`Erro ao processar cliente ${cliente.USUARIO}:`, err.message);
                    return false;
                }
             })();
             emailPromises.push(promise);
             count++;
           }
        }
      });

      await Promise.all(emailPromises);

      res.status(200).json({ message: `E-mails de cobrança enviados para ${count} clientes pendentes.` });

    } catch (error) {
      console.error("Erro ao enviar e-mails em massa:", error);
      res.status(500).json({ error: "Erro ao processar envio em massa." });
    }
  });
});

/**
 * Envia e-mail de cobrança individual (PIX + Boleto)
 */
exports.sendBillingEmail = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
      }

      const { customer, amount, description } = req.body;

      // Gera Boleto
      const boletoOrder = await createPagarmeOrderInternal(customer, amount, 'boleto', description);
      const boletoUrl = boletoOrder.charges[0].last_transaction.pdf || boletoOrder.charges[0].last_transaction.url;

      // Gera PIX
      const pixOrder = await createPagarmeOrderInternal(customer, amount, 'pix', description);
      const pixCode = pixOrder.charges[0].last_transaction.qr_code;

      const mailOptions = {
        from: '"Lavoro Financeiro" <blutecnologiasbr@gmail.com>',
        to: customer.email,
        subject: `Fatura Lavoro - ${description}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h3>Prezado(a) ${customer.name},</h3>
            <p>Segue abaixo os dados para pagamento: <strong>${description}</strong>.</p>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Opção 1: PIX Copia e Cola</strong></p>
                <p style="word-break: break-all; font-family: monospace; background: #fff; padding: 10px; border: 1px solid #ddd;">${pixCode}</p>
                <p><small>Copie o código acima e cole no seu aplicativo bancário.</small></p>
            </div>

            <p><strong>Opção 2: Boleto Bancário</strong></p>
            <p>O boleto para pagamento encontra-se em anexo neste e-mail.</p>

            <br>
            <p>Caso já tenha efetuado o pagamento, por favor, desconsidere este aviso.</p>
            <p>Atenciosamente,<br><strong>Departamento Financeiro - Grupo Lavoro</strong></p>
          </div>
        `,
        attachments: [
            { filename: `Fatura_Lavoro.pdf`, path: boletoUrl }
        ]
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "E-mail enviado com sucesso!" });

    } catch (error) {
      console.error("Erro ao enviar e-mail individual:", error);
      res.status(500).json({ error: "Erro ao enviar e-mail.", details: error.message });
    }
  });
});