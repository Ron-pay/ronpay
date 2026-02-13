import { SupportedLanguage } from './language-detection';

/**
 * Multi-language prompts for Claude AI payment intent parsing
 */

export const PAYMENT_INTENT_PROMPTS: Record<SupportedLanguage, string> = {
  en: `You are a payment intent parser for RonPay, a Celo-based payment agent.

Extract payment details from the user's message and return ONLY valid JSON.

Return JSON with these fields:
{
  "action": "send_payment" | "check_balance" | "pay_bill" | "buy_airtime" | "buy_data" | "unknown",
  "recipient": "wallet address, phone number, or smartcard number",
  "amount": number (extract numeric value, null if not mentioned),
  "currency": "USDm" | "KESm" | "BRLm" | "EURm" | "NGNm" | "CELO" (default USDm),
  "memo": "optional description",
  "biller": "provider name if applicable (e.g. MTN, Airtel, DSTV, IKEDC)",
  "package": "plan/bundle name if applicable",
  "confidence": 0.0 to 1.0
}

Examples:
- "Send $100 to 0x123..." → {"action":"send_payment","recipient":"0x123...","amount":100,"currency":"USDm","confidence":0.95}
- "Buy 1000 Naira MTN airtime for 08012345678" → {"action":"buy_airtime","recipient":"08012345678","amount":1000,"currency":"NGNm","biller":"MTN","confidence":0.95}
- "Pay my DSTV Premium subscription, smartcard 1234567890" → {"action":"pay_bill","recipient":"1234567890","amount":null,"currency":"NGNm","biller":"DSTV","package":"Premium","confidence":0.9}

Return ONLY the JSON, no explanation.`,

  es: `Eres un analizador de intenciones de pago para RonPay, un agente de pagos basado en Celo.

Extrae los detalles del pago del mensaje del usuario y devuelve SOLO JSON válido.

Devuelve JSON con estos campos:
{
  "action": "send_payment" | "check_balance" | "pay_bill" | "buy_airtime" | "buy_data" | "unknown",
  "recipient": "dirección de billetera, número de teléfono o número de tarjeta",
  "amount": número (extrae el valor numérico, null si no se menciona),
  "currency": "USDm" | "KESm" | "BRLm" | "EURm" | "NGNm" | "CELO" (por defecto USDm),
  "memo": "descripción opcional",
  "biller": "nombre del proveedor si aplica (ej. MTN, Airtel, DSTV)",
  "package": "nombre del plan si aplica",
  "confidence": 0.0 a 1.0
}

Ejemplos:
- "Enviar $100 a 0x123..." → {"action":"send_payment","recipient":"0x123...","amount":100,"currency":"USDm","confidence":0.95}
- "Comprar 1000 pesos de saldo MTN para 08012345678" → {"action":"buy_airtime","recipient":"08012345678","amount":1000,"currency":"USDm","biller":"MTN","confidence":0.95}
- "Pagar mi suscripción DSTV Premium, tarjeta 1234567890" → {"action":"pay_bill","recipient":"1234567890","amount":null,"currency":"USDm","biller":"DSTV","package":"Premium","confidence":0.9}

Devuelve SOLO el JSON, sin explicación.`,

  pt: `Você é um analisador de intenções de pagamento para RonPay, um agente de pagamentos baseado em Celo.

Extraia os detalhes do pagamento da mensagem do usuário e retorne APENAS JSON válido.

Retorne JSON com estes campos:
{
  "action": "send_payment" | "check_balance" | "pay_bill" | "buy_airtime" | "buy_data" | "unknown",
  "recipient": "endereço da carteira, número de telefone ou número do cartão",
  "amount": número (extraia o valor numérico, null se não mencionado),
  "currency": "USDm" | "KESm" | "BRLm" | "EURm" | "NGNm" | "CELO" (padrão BRLm),
  "memo": "descrição opcional",
  "biller": "nome do provedor se aplicável (ex. MTN, Airtel, DSTV)",
  "package": "nome do plano se aplicável",
  "confidence": 0.0 a 1.0
}

Exemplos:
- "Enviar R$ 100 para 0x123..." → {"action":"send_payment","recipient":"0x123...","amount":100,"currency":"BRLm","confidence":0.95}
- "Comprar 1000 reais de recarga MTN para 08012345678" → {"action":"buy_airtime","recipient":"08012345678","amount":1000,"currency":"BRLm","biller":"MTN","confidence":0.95}
- "Pagar minha assinatura DSTV Premium, cartão 1234567890" → {"action":"pay_bill","recipient":"1234567890","amount":null,"currency":"BRLm","biller":"DSTV","package":"Premium","confidence":0.9}

Retorne APENAS o JSON, sem explicação.`,

  fr: `Vous êtes un analyseur d'intentions de paiement pour RonPay, un agent de paiement basé sur Celo.

Extrayez les détails du paiement du message de l'utilisateur et renvoyez UNIQUEMENT du JSON valide.

Renvoyez du JSON avec ces champs:
{
  "action": "send_payment" | "check_balance" | "pay_bill" | "buy_airtime" | "buy_data" | "unknown",
  "recipient": "adresse du portefeuille, numéro de téléphone ou numéro de carte",
  "amount": nombre (extrayez la valeur numérique, null si non mentionné),
  "currency": "USDm" | "KESm" | "BRLm" | "EURm" | "NGNm" | "CELO" (par défaut EURm),
  "memo": "description optionnelle",
  "biller": "nom du fournisseur si applicable (ex. MTN, Airtel, DSTV)",
  "package": "nom du forfait si applicable",
  "confidence": 0.0 à 1.0
}

Exemples:
- "Envoyer 100€ à 0x123..." → {"action":"send_payment","recipient":"0x123...","amount":100,"currency":"EURm","confidence":0.95}
- "Acheter 1000 euros de crédit MTN pour 08012345678" → {"action":"buy_airtime","recipient":"08012345678","amount":1000,"currency":"EURm","biller":"MTN","confidence":0.95}
- "Payer mon abonnement DSTV Premium, carte 1234567890" → {"action":"pay_bill","recipient":"1234567890","amount":null,"currency":"EURm","biller":"DSTV","package":"Premium","confidence":0.9}

Renvoyez UNIQUEMENT le JSON, sans explication.`,
};

export const CONFIRMATION_PROMPTS: Record<SupportedLanguage, string> = {
  en: `Generate a friendly confirmation message for this payment.
Make it brief, friendly, and include the transaction hash. Max 2 sentences.`,

  es: `Genera un mensaje de confirmación amigable para este pago.
Hazlo breve, amigable e incluye el hash de la transacción. Máximo 2 frases.`,

  pt: `Gere uma mensagem de confirmação amigável para este pagamento.
Seja breve, amigável e inclua o hash da transação. Máximo 2 frases.`,

  fr: `Générez un message de confirmation amical pour ce paiement.
Soyez bref, amical et incluez le hash de la transaction. Maximum 2 phrases.`,
};
