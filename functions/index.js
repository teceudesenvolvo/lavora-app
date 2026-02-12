const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// --- CONFIGURAÇÕES ---
// Em produção, use: firebase functions:config:set pagarme.key="sk_..." whatsapp.token="EAAG..."
// Para teste local, você pode substituir as strings abaixo.
// IMPORTANTE: Substitua pelos seus tokens reais obtidos em https://developers.facebook.com/apps/
const PAGARME_API_KEY = process.env.PAGARME_KEY || "sk_test_5a75852652f14d568d657f5fe7793860";
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "EAAG..."; // Cole seu Token Permanente ou Temporário aqui
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || "1234567890"; // Cole o ID do número de telefone aqui

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

      // Formata as regras de split para o padrão Pagar.me V5
      const formattedSplit = split_rules ? split_rules.map(rule => ({
        recipient_id: rule.recipient_id,
        amount: rule.percentage, // Na V5, se type=percentage, amount é a porcentagem (ex: 80)
        type: "percentage",
        options: {
          charge_processing_fee: rule.charge_processing_fee,
          liable: rule.liable,
          charge_remainder_fee: rule.liable // Geralmente quem é liable absorve a diferença de arredondamento
        }
      })) : [];

      // Monta o objeto do pedido conforme a API v5 da Pagar.me
      const orderData = {
        customer: {
          name: customer.name,
          email: customer.email || "cliente@lavoro.com.br",
          type: "individual",
          document: customer.document ? customer.document.replace(/\D/g, '') : "00000000000",
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
            // Regras de Split formatadas
            split: formattedSplit 
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

      res.status(200).json({ status: response.data.status });
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