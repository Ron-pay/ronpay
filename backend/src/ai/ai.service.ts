
import { PaymentIntent } from 'src/types';
import { SupportedLanguage } from './language-detection';

export abstract class AiService {
  abstract parsePaymentIntent(
    userMessage: string,
    language?: SupportedLanguage,
  ): Promise<PaymentIntent>;

  abstract generatePaymentConfirmation(
    amount: number,
    currency: string,
    recipient: string,
    txHash: string,
    language?: SupportedLanguage,
  ): Promise<string>;
}
