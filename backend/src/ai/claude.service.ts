import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PaymentIntent } from 'src/types';

@Injectable()
export class ClaudeService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured in environment');
    }
    
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Parse natural language payment intent using Claude AI
   */
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
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const result = JSON.parse(content.text);
      return result as PaymentIntent;
    } catch (error) {
      console.error('Error parsing payment intent:', error);
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
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = message.content[0];
      return content.type === 'text' ? content.text : 'Payment sent successfully!';
    } catch (error) {
      return `Successfully sent ${amount} ${currency} to ${recipient}. Transaction: ${txHash}`;
    }
  }
}
