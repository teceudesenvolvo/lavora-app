const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
const nodemailer = require("nodemailer");

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
           
           const paymentMethod = charges && charges[0] ? charges[0].payment_method : 'API';
           const methodLabel = paymentMethod === 'pix' ? 'Pix' : (paymentMethod === 'boleto' ? 'Boleto' : 'Cartão');

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
      const lastCharge = charges.length > 0 ? charges[charges.length - 1] : null;
      const payment_method = lastCharge ? lastCharge.payment_method : 'API';

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
 * Envia e-mails de cobrança em massa para todos os clientes ativos
 */
exports.sendBulkBillingEmails = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Busca todos os clientes
      const snapshot = await admin.database().ref('clientes').once('value');
      const clientes = snapshot.val();

      if (!clientes) {
        return res.status(200).json({ message: "Nenhum cliente encontrado." });
      }

      const emailPromises = [];
      let count = 0;

      Object.values(clientes).forEach(cliente => {
        // Verifica se tem email e se está ativo
        if (cliente.EMAIL && cliente.STATUS === 'Ativo') {
           const mailOptions = {
            from: '"Lavoro Financeiro" <blutecnologiasbr@gmail.com>',
            to: cliente.EMAIL,
            subject: 'Aviso de Cobrança - Lavoro',
            html: `
              <div style="font-family: Arial, sans-serif; color: #333;">
                <h3>Prezado(a) ${cliente.USUARIO || 'Cliente'},</h3>
                <p>Esperamos que este e-mail o encontre bem.</p>
                <p>Gostaríamos de lembrar sobre a disponibilidade da sua fatura mensal. Por favor, verifique seu painel do cliente para visualizar os detalhes ou realizar o pagamento.</p>
                <p>Caso já tenha efetuado o pagamento, por favor, desconsidere este aviso.</p>
                <br>
                <p>Estamos à disposição para quaisquer dúvidas.</p>
                <p>Atenciosamente,<br><strong>Departamento Financeiro - Grupo Lavoro</strong></p>
              </div>
            `
          };
          emailPromises.push(transporter.sendMail(mailOptions));
          count++;
        }
      });

      await Promise.all(emailPromises);

      res.status(200).json({ message: `E-mails de cobrança enviados para ${count} clientes ativos.` });

    } catch (error) {
      console.error("Erro ao enviar e-mails em massa:", error);
      res.status(500).json({ error: "Erro ao processar envio em massa." });
    }
  });
});