import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface WiseQuoteResponse {
  id: string;
  source: string;
  target: string;
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  fee: number;
  feePercentage: number;
}

/**
 * Wise API Provider for real-time fee quotes
 * @see https://api-docs.wise.com/
 */
@Injectable()
export class WiseProvider {
  private readonly logger = new Logger(WiseProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get('WISE_API_KEY') || '';
    this.apiUrl = this.configService.get('WISE_API_URL', 'https://api.wise.com');

    if (!this.apiKey) {
      this.logger.warn('WISE_API_KEY not configured - using mock data');
    }
  }

  /**
   * Get quote from Wise for currency conversion
   * @param sourceCurrency Source currency code (e.g., 'USD')
   * @param targetCurrency Target currency code (e.g., 'NGN')
   * @param amount Amount in source currency
   */
  async getQuote(
    sourceCurrency: string,
    targetCurrency: string,
    amount: number,
  ): Promise<{
    fee: number;
    exchangeRate: number;
    recipientReceives: number;
    totalCost: number;
  }> {
    // If API key not configured, return mock data
    if (!this.apiKey) {
      return this.getMockQuote(sourceCurrency, targetCurrency, amount);
    }

    try {
      this.logger.log(`Fetching Wise quote: ${amount} ${sourceCurrency} → ${targetCurrency}`);

      // Wise API Quote endpoint
      const response = await axios.post<WiseQuoteResponse>(
        `${this.apiUrl}/v3/quotes`,
        {
          sourceCurrency,
          targetCurrency,
          sourceAmount: amount,
          profile: null, // Personal profile
          paymentOption: null, // Default payment option
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        },
      );

      const quote = response.data;

      this.logger.log(`Wise quote received: ${quote.targetAmount} ${targetCurrency} (rate: ${quote.rate})`);

      return {
        fee: quote.fee,
        exchangeRate: quote.rate,
        recipientReceives: quote.targetAmount,
        totalCost: amount + quote.fee,
      };
    } catch (error) {
      this.logger.error(`Wise API error: ${error.message}`, error.stack);
      
      // Fallback to mock data on error
      this.logger.warn('Falling back to mock Wise data');
      return this.getMockQuote(sourceCurrency, targetCurrency, amount);
    }
  }

  /**
   * Mock Wise quotes for testing/fallback
   * Based on typical Wise fees (0.4-1% + fixed fee)
   */
  private getMockQuote(
    sourceCurrency: string,
    targetCurrency: string,
    amount: number,
  ) {
    this.logger.log(`Using mock Wise quote for ${sourceCurrency} → ${targetCurrency}`);

    // Get realistic exchange rate
    const rate = this.getMockExchangeRate(sourceCurrency, targetCurrency);
    
    // Wise typical fees: 0.4-1.0% + small fixed fee
    const feePercent = 0.6; // 0.6%
    const fixedFee = sourceCurrency === 'USD' ? 2.0 : sourceCurrency === 'EUR' ? 1.5 : 0;
    const fee = (amount * feePercent / 100) + fixedFee;
    
    const recipientReceives = (amount - fee) * rate;
    const totalCost = amount + fee;

    return {
      fee,
      exchangeRate: rate,
      recipientReceives,
        totalCost, // Use calculated totalCost, not amount
    };
  }

  /**
   * Mock exchange rates (realistic mid-market rates)
   */
  private getMockExchangeRate(from: string, to: string): number {
    const rates: Record<string, Record<string, number>> = {
      USD: {
        NGN: 1505, // USD to NGN
        KES: 130,  // USD to KES
        BRL: 5.75, // USD to BRL
        EUR: 0.91, // USD to EUR
      },
      EUR: {
        NGN: 1650, // EUR to NGN
        KES: 142,  // EUR to KES
        USD: 1.10, // EUR to USD
      },
      BRL: {
        USD: 0.174, // BRL to USD
      },
    };

    return rates[from]?.[to] || 1;
  }
}
