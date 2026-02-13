import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class FeeComparisonDto {
  @IsString()
  @IsNotEmpty()
  from: string; // Currency code (e.g., 'USD', 'EUR')

  @IsString()
  @IsNotEmpty()
  to: string; // Currency code (e.g., 'NGN', 'KES')

  @IsNumber()
  @IsNotEmpty()
  amount: number; // Amount to send in source currency
}

export interface ProviderQuote {
  fee: number;
  exchangeRate: number;
  recipientReceives: number;
  totalCost: number;
  provider: string;
}

export interface FeeComparisonResponse {
  corridor: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  providers: {
    ronpay: ProviderQuote;
    wise: ProviderQuote;
  };
  savings: {
    vsWise: number;
    savingsPercent: number;
  };
  timestamp: string;
}
