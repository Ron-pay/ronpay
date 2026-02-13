import { Controller, Get, Query } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeeComparisonDto } from './dto/fee-comparison.dto';

/**
 * Fee Comparison Controller
 * Exposes endpoints for comparing remittance fees
 */
@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  /**
   * Compare fees for a specific corridor
   * @example GET /fees/compare?from=USD&to=NGN&amount=100
   */
  @Get('compare')
  async compareFees(@Query() dto: FeeComparisonDto) {
    // Convert amount from string to number
    const comparisonDto: FeeComparisonDto = {
      from: dto.from,
      to: dto.to,
      amount: parseFloat(dto.amount as any),
    };

    return this.feesService.compareFees(comparisonDto);
  }

  /**
   * Get list of supported corridors
   * @example GET /fees/corridors
   */
  @Get('corridors')
  getSupportedCorridors() {
    return {
      corridors: this.feesService.getSupportedCorridors(),
      count: this.feesService.getSupportedCorridors().length,
    };
  }
}
