import { SupportedLanguage } from '../../ai/language-detection';

/**
 * Multi-language message templates for notifications
 */

interface TemplateContext {
  amount: number;
  currency: string;
  recipient?: string;
  txHash?: string;
  savings?: number;
  date?: string;
  explorerUrl?: string;
}

/**
 * Payment sent confirmation templates
 */
export const PAYMENT_SENT_TEMPLATES: Record<SupportedLanguage, (ctx: TemplateContext) => string> = {
  en: (ctx) => `✅ Payment sent! ${ctx.amount} ${ctx.currency} to ${ctx.recipient || 'recipient'}.${ctx.savings ? ` You saved $${ctx.savings.toFixed(2)} vs Wise!` : ''} Tx: ${ctx.explorerUrl || ctx.txHash}`,
  
  es: (ctx) => `✅ ¡Pago enviado! ${ctx.amount} ${ctx.currency} a ${ctx.recipient || 'destinatario'}.${ctx.savings ? ` Ahorraste $${ctx.savings.toFixed(2)} vs Wise!` : ''} Tx: ${ctx.explorerUrl || ctx.txHash}`,
  
  pt: (ctx) => `✅ Pagamento enviado! ${ctx.amount} ${ctx.currency} para ${ctx.recipient || 'destinatário'}.${ctx.savings ? ` Você economizou $${ctx.savings.toFixed(2)} vs Wise!` : ''} Tx: ${ctx.explorerUrl || ctx.txHash}`,
  
  fr: (ctx) => `✅ Paiement envoyé! ${ctx.amount} ${ctx.currency} à ${ctx.recipient || 'destinataire'}.${ctx.savings ? ` Vous avez économisé $${ctx.savings.toFixed(2)} vs Wise!` : ''} Tx: ${ctx.explorerUrl || ctx.txHash}`,
};

/**
 * Payment received notification templates
 */
export const PAYMENT_RECEIVED_TEMPLATES: Record<SupportedLanguage, (ctx: TemplateContext) => string> = {
  en: (ctx) => `💰 You received ${ctx.amount} ${ctx.currency}! Check your RonPay wallet. Tx: ${ctx.txHash?.slice(0, 10)}...`,
  
  es: (ctx) => `💰 ¡Recibiste ${ctx.amount} ${ctx.currency}! Revisa tu billetera RonPay. Tx: ${ctx.txHash?.slice(0, 10)}...`,
  
  pt: (ctx) => `💰 Você recebeu ${ctx.amount} ${ctx.currency}! Confira sua carteira RonPay. Tx: ${ctx.txHash?.slice(0, 10)}...`,
  
  fr: (ctx) => `💰 Vous avez reçu ${ctx.amount} ${ctx.currency}! Vérifiez votre portefeuille RonPay. Tx: ${ctx.txHash?.slice(0, 10)}...`,
};

/**
 * Recurring payment reminder templates
 */
export const RECURRING_REMINDER_TEMPLATES: Record<SupportedLanguage, (ctx: TemplateContext) => string> = {
  en: (ctx) => `⏰ Reminder: Recurring payment of ${ctx.amount} ${ctx.currency} to ${ctx.recipient} scheduled for ${ctx.date}. Ensure sufficient balance!`,
  
  es: (ctx) => `⏰ Recordatorio: Pago recurrente de ${ctx.amount} ${ctx.currency} a ${ctx.recipient} programado para ${ctx.date}. ¡Asegura saldo suficiente!`,
  
  pt: (ctx) => `⏰ Lembrete: Pagamento recorrente de ${ctx.amount} ${ctx.currency} para ${ctx.recipient} agendado para ${ctx.date}. Garanta saldo suficiente!`,
  
  fr: (ctx) => `⏰ Rappel: Paiement récurrent de ${ctx.amount} ${ctx.currency} à ${ctx.recipient} prévu pour ${ctx.date}. Assurez un solde suffisant!`,
};

/**
 * Failed payment notification templates
 */
export const FAILED_PAYMENT_TEMPLATES: Record<SupportedLanguage, (ctx: TemplateContext) => string> = {
  en: (ctx) => `❌ Payment of ${ctx.amount} ${ctx.currency} failed. Please check your balance and try again.`,
  
  es: (ctx) => `❌ El pago de ${ctx.amount} ${ctx.currency} falló. Por favor verifica tu saldo e intenta nuevamente.`,
  
  pt: (ctx) => `❌ O pagamento de ${ctx.amount} ${ctx.currency} falhou. Por favor verifique seu saldo e tente novamente.`,
  
  fr: (ctx) => `❌ Le paiement de ${ctx.amount} ${ctx.currency} a échoué. Veuillez vérifier votre solde et réessayer.`,
};

/**
 * Get Celo block explorer URL for transaction
 */
export function getTxExplorerUrl(txHash: string): string {
  return `https://celoscan.io/tx/${txHash}`;
}
