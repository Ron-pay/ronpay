import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { PaymentIntent } from 'src/types';
import { AiService } from './ai.service';
import { detectLanguage, SupportedLanguage, getDefaultCurrency } from './language-detection';
import { PAYMENT_INTENT_PROMPTS, CONFIRMATION_PROMPTS } from './prompts';

@Injectable()
export class GeminiService implements AiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured in environment');
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || '' });
  }

  async parsePaymentIntent(
    userMessage: string,
    language?: SupportedLanguage,
  ): Promise<PaymentIntent> {
    // Auto-detect language if not provided
    const detectedLang = language || detectLanguage(userMessage);
    console.log(`[GeminiService] Parsing intent in language: ${detectedLang}`);

    // Get language-specific prompt
    const basePrompt = PAYMENT_INTENT_PROMPTS[detectedLang];
    const fullPrompt = `${basePrompt}\n\nUser message: "${userMessage}"`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt,
      });

      let text = response?.text;
      if (!text) throw new Error('Empty response from Gemini');
      
      // Clean up markdown code blocks if present
      text = text.replace(/```json\n?|\n?```/g, '').trim();

      const intent = JSON.parse(text);

      // Set default currency based on language if not specified
      if (!intent.currency) {
        intent.currency = getDefaultCurrency(detectedLang);
      }

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
    language: SupportedLanguage = 'en',
  ): Promise<string> {
    const basePrompt = CONFIRMATION_PROMPTS[language];
    const fullPrompt = `${basePrompt}\n\nAmount: ${amount} ${currency}\nRecipient: ${recipient}\nTransaction: ${txHash}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: fullPrompt,
      });
      return response?.text || this.getDefaultConfirmation(amount, currency, recipient, txHash, language);
    } catch (error) {
      console.error('Error generating confirmation with Gemini:', error);
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
