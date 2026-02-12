
import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PaymentIntent } from 'src/types';
import { AiService } from './ai.service';

@Injectable()
export class GeminiService implements AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured in environment');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async parsePaymentIntent(userMessage: string): Promise<PaymentIntent> {
    const prompt = `You are a payment intent parser for RonPay, a Celo-based payment agent.

Extract payment details from the user's message and return ONLY valid JSON.

User message: "${userMessage}"

Return JSON with these fields:
{
  "action": "send_payment" | "check_balance" | "pay_bill" | "buy_airtime" | "buy_data" | "unknown",
  "recipient": "wallet address, phone number, or smartcard number",
  "amount": number (extract numeric value, null if not mentioned),
  "currency": "cUSD" | "cKES" | "cREAL" | "CELO" | "NGN" | "KES" (default cUSD for crypto, NGN for Nigerian bills),
  "memo": "optional description",
  "biller": "provider name if applicable (e.g. MTN, Airtel, DSTV, IKEDC, EEDC)",
  "package": "plan/bundle name if applicable (e.g. 1GB, Premium, Prepaid)",
  "confidence": 0.0 to 1.0
}

Examples:
- "Send $100 to 0x123..." → {"action":"send_payment","recipient":"0x123...","amount":100,"currency":"cUSD","biller":null,"package":null,"confidence":0.95}
- "Buy 1000 Naira MTN airtime for 08012345678" → {"action":"buy_airtime","recipient":"08012345678","amount":1000,"currency":"NGN","biller":"MTN","package":null,"confidence":0.95}
- "Pay my DSTV Premium subscription with smartcard 1234567890" → {"action":"pay_bill","recipient":"1234567890","amount":null,"currency":"NGN","biller":"DSTV","package":"Premium","confidence":0.9}
- "Buy 1GB MTN data for 080..." → {"action":"buy_data","recipient":"080...","amount":null,"currency":"NGN","biller":"MTN","package":"1GB","confidence":0.9}

Return ONLY the JSON, no explanation.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json\n?|\n?```/g, '').trim();

      const intent = JSON.parse(text);
      return intent as PaymentIntent;
    } catch (error) {
      console.error('Error parsing payment intent with Gemini:', error);
      return {
        action: 'unknown',
        confidence: 0,
      };
    }
  }

  /**
   * Generate human-friendly response for payment confirmation
   */
  async generatePaymentConfirmation(
    amount: number,
    currency: string,
    recipient: string,
    txHash: string,
  ): Promise<string> {
    const prompt = `Generate a friendly confirmation message for this payment:

Amount: ${amount} ${currency}
Recipient: ${recipient}
Transaction: ${txHash}

Make it brief, friendly, and include the transaction hash. Max 2 sentences.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      return `Successfully sent ${amount} ${currency} to ${recipient}. Transaction: ${txHash}`;
    }
  }
}
