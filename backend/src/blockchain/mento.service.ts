import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CeloService, CELO_TOKENS } from './celo.service';
import { providers, utils, BigNumber } from 'ethers';
import { Mento } from '@mento-protocol/mento-sdk';
import Redis from 'ioredis';

@Injectable()
export class MentoService implements OnModuleInit {
  private redis: Redis;
  private readonly logger = new Logger(MentoService.name);
  private readonly CACHE_TTL = 30; // 30 seconds for real rates
  private mento: Mento;
  private provider: providers.JsonRpcProvider;

  constructor(
    private readonly celoService: CeloService,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    // Initialize Redis for caching
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
    });

    // Initialize Ethers Provider for Mento SDK
    const rpcUrl = this.configService.get('CELO_RPC_URL', 'https://forno.celo.org');
    this.provider = new providers.JsonRpcProvider(rpcUrl);

    try {
      this.mento = await Mento.create(this.provider);
      this.logger.log('Mento SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Mento SDK', error);
    }
  }

  /**
   * Get a quote for swapping tokens using real Mento Protocol rates with caching
   */
  async getSwapQuote(
    fromToken: keyof typeof CELO_TOKENS,
    toToken: keyof typeof CELO_TOKENS,
    amountIn: string,
  ) {
    const fromAddress = CELO_TOKENS[fromToken];
    const toAddress = CELO_TOKENS[toToken];

    if (fromAddress === 'native' || toAddress === 'native') {
      throw new Error('Native CELO swaps not fully supported for this operation.');
    }

    // Check cache first
    const cacheKey = `rate:${fromToken}:${toToken}:${amountIn}`;
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        this.logger.debug(`Using cached rate for ${fromToken} → ${toToken}`);
        return cachedData;
      }
    } catch (cacheError) {
      // Ignore cache errors
    }

    try {
      // Use Mento SDK to get amount out
      // Assuming 18 decimals for stablecoins (cUSD, cEUR, etc)
      const amountInWei = utils.parseUnits(amountIn, 18);

      const amountOutWei = await this.mento.getAmountOut(
        fromAddress,
        toAddress,
        amountInWei
      );

      const amountOut = utils.formatUnits(amountOutWei, 18);

      // Calculate derived price (rate)
      const price = parseFloat(amountOut) / parseFloat(amountIn);

      const result = {
        amountOut,
        price,
        source: 'mento-sdk-v1',
        timestamp: Date.now(),
      };

      // Cache the result
      await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(result));

      this.logger.log(`Fetched Mento rate: 1 ${fromToken} = ${price.toFixed(4)} ${toToken}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to fetch Mento quote: ${error.message}`, error.stack);
      // Fallback to mock if SDK fails (or if pair doesn't exist)
      this.logger.warn('Falling back to mock quotes due to error');
      return this.getMockQuote(fromToken, toToken as string, amountIn);
    }
  }

  /**
   * Fallback mock quotes (kept for resilience)
   */
  private getMockQuote(from: string, to: string, amount: string) {
    let rate = 1;
    // Mock rates
    if (from === 'USDm' && to === 'NGNm') rate = 1520;
    if (from === 'NGNm' && to === 'USDm') rate = 1 / 1520;
    if (from === 'USDm' && to === 'KESm') rate = 132; 
    if (from === 'KESm' && to === 'USDm') rate = 1 / 132;
    if (from === 'USDm' && to === 'BRLm') rate = 5.8; 
    if (from === 'BRLm' && to === 'USDm') rate = 1 / 5.8;

    // EURm rates
    if (from === 'EURm' && to === 'NGNm') rate = 1680;
    if (from === 'NGNm' && to === 'EURm') rate = 1 / 1680;

    const amountOut = (parseFloat(amount) * rate).toString();
    return {
      amountOut,
      price: rate,
      source: 'mock-fallback',
    };
  }
}
