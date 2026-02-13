import { Injectable, Logger } from '@nestjs/common';
import { MentoService } from '../../blockchain/mento.service';
import { CELO_TOKENS } from '../../blockchain/celo.service';

/**
 * RonPay cost calculator using Celo + Mento Protocol
 */
@Injectable()
export class CeloMentoProvider {
  private readonly logger = new Logger(CeloMentoProvider.name);
  
  // Estimated gas costs in USD
  private readonly GAS_COST_USD = 0.001; // ~$0.001 per transaction on Celo

  constructor(private readonly mentoService: MentoService) {}

  /**
   * Calculate RonPay total cost for a transfer
   * @param sourceCurrency Source currency (USD, EUR, etc.)
   * @param targetCurrency Target currency (NGN, KES, etc.)
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
    this.logger.log(`Calculating RonPay cost: ${amount} ${sourceCurrency} → ${targetCurrency}`);

    // Map currency codes to Celo token names
    const fromToken = this.mapCurrencyToToken(sourceCurrency);
    const toToken = this.mapCurrencyToToken(targetCurrency);

    try {
      // Get Mento quote
      const mentoQuote = await this.mentoService.getSwapQuote(
        fromToken,
        toToken,
        amount.toString(),
      );

      const exchangeRate = mentoQuote.price;
      const recipientReceives = parseFloat(mentoQuote.amountOut);

      // RonPay fee = just gas cost (no markup!)
      const fee = this.GAS_COST_USD;
      const totalCost = amount + fee;

      this.logger.log(`RonPay quote: ${recipientReceives} ${targetCurrency} (fee: $${fee})`);

      return {
        fee,
        exchangeRate,
        recipientReceives,
        totalCost,
      };
    } catch (error) {
      this.logger.error(`Error getting Mento quote: ${error.message}`);
      throw error;
    }
  }

  /**
   * Map currency codes (USD, NGN, etc.) to Celo token names (USDm, NGNm, etc.)
   */
  private mapCurrencyToToken(currency: string): keyof typeof CELO_TOKENS {
    const mapping: Record<string, keyof typeof CELO_TOKENS> = {
      USD: 'USDm',
      NGN: 'NGNm',
      KES: 'KESm',
      BRL: 'BRLm',
      EUR: 'EURm',
    };

    const token = mapping[currency.toUpperCase()];
    if (!token) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    return token;
  }
}
