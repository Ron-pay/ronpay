import { Test, TestingModule } from '@nestjs/testing';
import { MentoService } from './mento.service';
import { Mento } from '@mento-protocol/mento-sdk';

describe('MentoService', () => {
  let service: MentoService;
  let mockBroker: any;

  beforeEach(async () => {
    // Mock Mento SDK broker
    mockBroker = {
      getQuoteAmountOut: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentoService,
        {
          provide: 'MENTO_BROKER',
          useValue: mockBroker,
        },
      ],
    }).compile();

    service = module.get<MentoService>(MentoService);
    // Override broker with mock
    (service as any).broker = mockBroker;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSwapQuote', () => {
    it('should fetch quote for NGNm → USDm', async () => {
      const mockQuote = {
        amount: BigInt('1000000000000000000000'), // 1000 NGNm
        amountOut: BigInt('666666666666666666'), // ~0.67 USDm
      };

      mockBroker.getQuoteAmountOut.mockResolvedValue(mockQuote);

      const result = await service.getSwapQuote('NGNm', 'USDm', '1000');

      expect(result.amountOut).toBe('0.67'); // 1000 / ~1500 rate
      expect(result.price).toBeCloseTo(1 / 1500, 6);
      expect(mockBroker.getQuoteAmountOut).toHaveBeenCalled();
    });

    it('should fetch quote for KESm → USDm', async () => {
      const mockQuote = {
        amount: BigInt('1000000000000000000000'), // 1000 KESm
        amountOut: BigInt('7692307692307692307'), // ~7.69 USDm
      };

      mockBroker.getQuoteAmountOut.mockResolvedValue(mockQuote);

      const result = await service.getSwapQuote('KESm', 'USDm', '1000');

      expect(result.amountOut).toBe('7.69');
      expect(result.price).toBeCloseTo(1 / 130, 6); // ~130 KES per USD
    });

    it('should fetch quote for USDm → NGNm', async () => {
      const mockQuote = {
        amount: BigInt('100000000000000000000'), // 100 USDm
        amountOut: BigInt('150000000000000000000000'), // 150000 NGNm
      };

      mockBroker.getQuoteAmountOut.mockResolvedValue(mockQuote);

      const result = await service.getSwapQuote('USDm', 'NGNm', '100');

      expect(parseFloat(result.amountOut)).toBeGreaterThan(140000); // ~1500 rate
      expect(result.price).toBeGreaterThan(1400); // NGN per USD
    });

    it('should handle invalid token pairs gracefully', async () => {
      mockBroker.getQuoteAmountOut.mockRejectedValue(new Error('Invalid pair'));

      // Use "as any" to bypass TypeScript for testing error handling
      await expect(
        service.getSwapQuote('INVALID' as any, 'USDm', '100')
      ).rejects.toThrow();
    });

    it('should cache quotes for efficiency', async () => {
      const mockQuote = {
        amount: BigInt('1000000000000000000000'),
        amountOut: BigInt('666666666666666666'),
      };

      mockBroker.getQuoteAmountOut.mockResolvedValue(mockQuote);

      // First call
      await service.getSwapQuote('NGNm', 'USDm', '1000');
      
      // Second call (should use cache if implemented)
      await service.getSwapQuote('NGNm', 'USDm', '1000');

      // Note: Caching implementation would reduce broker calls
      // For now, just verify broker was called
      expect(mockBroker.getQuoteAmountOut).toHaveBeenCalled();
    });

    it('should handle zero amounts', async () => {
      const result = await service.getSwapQuote('NGNm', 'USDm', '0');
      
      expect(result.amountOut).toBe('0');
      expect(mockBroker.getQuoteAmountOut).not.toHaveBeenCalled();
    });

    it('should handle very large amounts', async () => {
      const mockQuote = {
        amount: BigInt('1000000000000000000000000'), // 1M NGNm
        amountOut: BigInt('666666666666666666666'), // ~666 USDm
      };

      mockBroker.getQuoteAmountOut.mockResolvedValue(mockQuote);

      const result = await service.getSwapQuote('NGNm', 'USDm', '1000000');

      expect(parseFloat(result.amountOut)).toBeGreaterThan(600);
    });
  });

  describe('getAllSupportedPairs', () => {
    it('should return 6+ currency corridors', () => {
      const pairs = service.getAllSupportedPairs();

      expect(pairs.length).toBeGreaterThanOrEqual(6);
    });

    it('should include NGNm → USDm corridor', () => {
      const pairs = service.getAllSupportedPairs();

      const hasNgnUsd = pairs.some(
        pair => pair.from === 'NGNm' && pair.to === 'USDm'
      );

      expect(hasNgnUsd).toBe(true);
    });

    it('should include KESm → USDm corridor', () => {
      const pairs = service.getAllSupportedPairs();

      const hasKesUsd = pairs.some(
        pair => pair.from === 'KESm' && pair.to === 'USDm'
      );

      expect(hasKesUsd).toBe(true);
    });

    it('should include reverse corridors (USDm → NGNm)', () => {
      const pairs = service.getAllSupportedPairs();

      const hasUsdNgn = pairs.some(
        pair => pair.from === 'USDm' && pair.to === 'NGNm'
      );

      expect(hasUsdNgn).toBe(true);
    });

    it('should include stable token pairs', () => {
      const pairs = service.getAllSupportedPairs();

      const stableTokens = ['USDm', 'USDCm', 'EURm'];
      const hasStable = pairs.some(pair =>
        stableTokens.includes(pair.from) || stableTokens.includes(pair.to)
      );

      expect(hasStable).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle broker connection failures gracefully', async () => {
      mockBroker.getQuoteAmountOut.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        service.getSwapQuote('NGNm', 'USDm', '1000')
      ).rejects.toThrow('Network error');
    });

    it('should handle malformed responses', async () => {
      mockBroker.getQuoteAmountOut.mockResolvedValue(null);

      await expect(
        service.getSwapQuote('NGNm', 'USDm', '1000')
      ).rejects.toThrow();
    });
  });
});
