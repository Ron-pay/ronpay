import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PaymentIntent } from 'src/types';
import { AiService } from './ai.service';
import { detectLanguage, SupportedLanguage, getDefaultCurrency } from './language-detection';
import { PAYMENT_INTENT_PROMPTS, CONFIRMATION_PROMPTS } from './prompts';

@Injectable()
export class ClaudeService implements AiService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.warn('ANTHROPIC_API_KEY not configured in environment');
    }

    this.client = new Anthropic({ apiKey: apiKey || '' });
  }

  /**
   * Parse payment intent with multi-language support
   * @param userMessage User's natural language message
   * @param language Optional language code (auto-detected if not provided)
   */
  async parsePaymentIntent(
    userMessage: string,
    language?: SupportedLanguage,
  ): Promise<PaymentIntent> {
    // Auto-detect language if not provided
    const detectedLang = language || detectLanguage(userMessage);

    console.log(`[ClaudeService] Parsing intent in language: ${detectedLang}`);

    // Get language-specific prompt
    const basePrompt = PAYMENT_INTENT_PROMPTS[detectedLang];
    const fullPrompt = `${basePrompt}\n\nUser message: "${userMessage}"`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: fullPrompt }],
      });

      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      let text = content.text;

      // Try to extract JSON between curly braces if it's not a direct JSON string
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      // Clean up markdown code blocks if present
      text = text.replace(/```json\n?|\n?```/g, '').trim();

      const result = JSON.parse(text);

      // Normalize action names if AI uses slightly different ones
      if (result.action === 'send' || result.action === 'transfer') {
        result.action = 'send_payment';
      }

      if (result.action === 'balance') {
        result.action = 'check_balance';
      }

      // Set default currency based on language if not specified
      if (!result.currency) {
        result.currency = getDefaultCurrency(detectedLang);
      }

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
   * Generate payment confirmation with multi-language support
   */
  async generatePaymentConfirmation(
    amount: number,
    currency: string,
    recipient: string,
    txHash: string,
    language: SupportedLanguage = 'en',
  ): Promise<string> {
    const basePrompt = CONFIRMATION_PROMPTS[language];
    const fullPrompt = `${basePrompt}\n\nAmount: ${amount} ${currency}\nRecipient: ${recipient}\nTransaction: ${txHash}`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{ role: 'user', content: fullPrompt }],
      });

      const content = message.content[0];
      return content.type === 'text'
        ? content.text
        : this.getDefaultConfirmation(amount, currency, recipient, txHash, language);
    } catch (error) {
      return this.getDefaultConfirmation(amount, currency, recipient, txHash, language);
    }
  }

  /**
   * Fallback confirmation messages in multiple languages
   */
  private getDefaultConfirmation(
    amount: number,
    currency: string,
    recipient: string,
    txHash: string,
    language: SupportedLanguage,
  ): string {
    const confirmations: Record<SupportedLanguage, string> = {
      en: `Successfully sent ${amount} ${currency} to ${recipient}. Transaction: ${txHash}`,
      es: `Se enviaron ${amount} ${currency} a ${recipient} exitosamente. Transacción: ${txHash}`,
      pt: `${amount} ${currency} enviados para ${recipient} com sucesso. Transação: ${txHash}`,
      fr: `${amount} ${currency} envoyés à ${recipient} avec succès. Transaction: ${txHash}`,
    };

    return confirmations[language] || confirmations.en;
  }
}
