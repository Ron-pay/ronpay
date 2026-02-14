/**
 * Payment Intent Types
 * Matches backend API response structure
 */

export type PaymentAction =
  | "send_payment"
  | "check_balance"
  | "pay_bill"
  | "buy_airtime"
  | "unknown";

export interface PaymentIntent {
  action: PaymentAction;
  recipient?: string;
  amount?: number;
  currency?: string;
  memo?: string;
  confidence?: number;
}

export interface TransactionData {
  to: string;
  value: string;
  data: `0x${string}`;
  feeCurrency: string;
}

export interface ParsedCommand {
  recipient: string;
  amount: number;
  currency: string;
  memo?: string;
}

export interface ParseIntentResponse {
  intent: PaymentIntent;
  transaction: TransactionData;
  parsedCommand: ParsedCommand;
}

export interface ExecutePaymentRequest {
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  txHash: string;
  intent?: string;
  memo?: string;
}

export interface TokenBalance {
  cUSD: number;
  CELO: number;
  cKES: number;
  cEUR: number;
  cREAL: number;
}

export interface BalanceResponse {
  address: string;
  balances: TokenBalance;
  timestamp: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface PurchaseAirtimeRequest {
  txHash: string;
  phoneNumber: string;
  amount: number;
  provider: string;
  walletAddress: string;
  memo?: string;
}

export interface AirtimePurchaseResponse {
  success: boolean;
  message: string;
  vtpassTransactionId?: string;
  localTxHash?: string;
  blockchainTxHash?: string;
  phoneNumber?: string;
  provider?: string;
  amount?: number;
  currency?: string;
  status?: "initiated" | "pending" | "delivered" | "failed";
  transactionDate?: string;
}
