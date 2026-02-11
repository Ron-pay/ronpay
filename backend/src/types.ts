export interface PaymentIntent {
  action: 'send_payment' | 'check_balance' | 'pay_bill' | 'unknown';
  recipient?: string;
  amount?: number;
  currency?: string;
  memo?: string;
  confidence?: number;
}