const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// --- CONFIGURAÇÕES ---
// Em produção, use: firebase functions:config:set pagarme.key="sk_..." whatsapp.token="EAAG..."
// Para teste local, você pode substituir as strings abaixo.
const PAGARME_API_KEY = process.env.PAGARME_KEY || "sk_test_SEU_TOKEN_PAGARME"; 
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "SEU_TOKEN_META_WHATSAPP";
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "SEU_PHONE_ID_WHATSAPP";

/**
 * Cria uma cobrança PIX com Split na Pagar.me (API v5)
 * Documentação: https://docs.pagar.me/reference/criar-pedido
 */
exports.createPagarmePixSplit = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Método não permitido");
      }

      const { amount, description, customer, split_rules } = req.body;

      // Monta o objeto do pedido conforme a API v5 da Pagar.me
      const orderData = {
        customer: {
          name: customer.name,
          email: "cliente@lavoro.com.br", // Email é obrigatório na v5 (pode vir do frontend se tiver)
          type: "individual",
          document: "00000000000", // CPF é obrigatório (ideal vir do frontend)
          phones: {
            mobile_phone: {
              country_code: "55",
              area_code: customer.phone.substring(2, 4), // Ex: 11
              number: customer.phone.substring(4)        // Ex: 999999999
            }
          }
        },
        items: [
          {
            amount: amount, // Valor em centavos
            description: description,
            quantity: 1,
            code: "REF-123"
          }
        ],
        payments: [
          {
            payment_method: "pix",
            pix: {
              expires_in: 3600 // Expira em 1 hora
            },
            // Regras de Split recebidas do frontend
            split: split_rules 
          }
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

      res.status(200).json({
        id: response.data.id,
        pixCopyPaste: pixTransaction.qr_code,
        pixQrCodeUrl: pixTransaction.qr_code_url,
        status: charge.status
      });

    } catch (error) {
      console.error("Erro Pagar.me:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Erro ao processar pagamento", 
        details: error.response?.data || error.message 
      });
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