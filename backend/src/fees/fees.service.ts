import { Injectable, Logger } from '@nestjs/common';
import { WiseProvider } from './providers/wise.provider';
import { CeloMentoProvider } from './providers/celo-mento.provider';
import { FeeComparisonDto, FeeComparisonResponse } from './dto/fee-comparison.dto';

/**
 * Fee Comparison Service
 * Compares RonPay fees against traditional remittance providers (Wise)
 */
@Injectable()
export class FeesService {
  private readonly logger = new Logger(FeesService.name);

  constructor(
    private readonly wiseProvider: WiseProvider,
    private readonly celoMentoProvider: CeloMentoProvider,
  ) {}

  /**
   * Compare fees across providers for a given corridor
   */
  async compareFees(dto: FeeComparisonDto): Promise<FeeComparisonResponse> {
    this.logger.log(`Comparing fees: ${dto.amount} ${dto.from} → ${dto.to}`);

    try {
      // Get quotes from both providers in parallel
      const [ronpayQuote, wiseQuote] = await Promise.all([
        this.celoMentoProvider.getQuote(dto.from, dto.to, dto.amount),
        this.wiseProvider.getQuote(dto.from, dto.to, dto.amount),
      ]);

      // Calculate savings
      const savingsVsWise = wiseQuote.totalCost - ronpayQuote.totalCost;
      const savingsPercent = (savingsVsWise / wiseQuote.totalCost) * 100;

      this.logger.log(`Savings: $${savingsVsWise.toFixed(2)} (${savingsPercent.toFixed(1)}%) vs Wise`);

      return {
        corridor: `${dto.from}_to_${dto.to}`,
        amount: dto.amount,
        sourceCurrency: dto.from,
        targetCurrency: dto.to,
        providers: {
          ronpay: {
            ...ronpayQuote,
            provider: 'RonPay (Celo + Mento)',
          },
          wise: {
            ...wiseQuote,
            provider: 'Wise',
          },
        },
        savings: {
          vsWise: parseFloat(savingsVsWise.toFixed(2)),
          savingsPercent: parseFloat(savingsPercent.toFixed(2)),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error comparing fees: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get supported corridors for fee comparison
   */
  getSupportedCorridors(): Array<{ from: string; to: string }> {
    return [
      { from: 'USD', to: 'NGN' },
      { from: 'USD', to: 'KES' },
      { from: 'USD', to: 'BRL' },
      { from: 'EUR', to: 'NGN' },
      { from: 'EUR', to: 'KES' },
      { from: 'USD', to: 'EUR' },
    ];
  }
}
