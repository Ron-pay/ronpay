
import { PaymentIntent } from 'src/types';

export abstract class AiService {
  abstract parsePaymentIntent(userMessage: string): Promise<PaymentIntent>;
  abstract generatePaymentConfirmation(
    amount: number,
    currency: string,
    recipient: string,
    txHash: string,
  ): Promise<string>;
}
