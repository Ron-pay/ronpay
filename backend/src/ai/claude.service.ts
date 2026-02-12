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
  "action": "send_payment" | "check_balance" | "pay_bill" | "unknown",
  "recipient": "wallet address (0x...) or phone number if mentioned, otherwise null",
  "amount": number (extract numeric value, null if not mentioned),
  "currency": "cUSD" | "cKES" | "cREAL" | "CELO" (default to cUSD if not specified),
  "memo": "optional payment description or null",
  "confidence": 0.0 to 1.0 (how confident you are in this parsing)
}

Examples:
- "Send $100 to 0x123..." → {"action":"send_payment","recipient":"0x123...","amount":100,"currency":"cUSD","memo":null,"confidence":0.95}
- "Check my balance" → {"action":"check_balance","recipient":null,"amount":null,"currency":null,"memo":null,"confidence":1.0}
- "Pay my DSTV bill" → {"action":"pay_bill","recipient":"DSTV","amount":null,"currency":"cUSD","memo":"DSTV subscription","confidence":0.8}

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
      return content.type === 'text'
        ? content.text
        : 'Payment sent successfully!';
    } catch (error) {
      return `Successfully sent ${amount} ${currency} to ${recipient}. Transaction: ${txHash}`;
    }
  }
}
