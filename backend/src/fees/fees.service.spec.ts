import { Test, TestingModule } from '@nestjs/testing';
import { FeesService } from './fees.service';
import { WiseProvider } from './providers/wise.provider';
import { CeloMentoProvider } from './providers/celo-mento.provider';

describe('FeesService', () => {
  let service: FeesService;
  let wiseProvider: WiseProvider;
  let celoMentoProvider: CeloMentoProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeesService,
        {
          provide: WiseProvider,
          useValue: {
            getQuote: jest.fn(),
            getSupportedCorridors: jest.fn(),
          },
        },
        {
          provide: CeloMentoProvider,
          useValue: {
            getQuote: jest.fn(),
            getSupportedCorridors: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FeesService>(FeesService);
    wiseProvider = module.get<WiseProvider>(WiseProvider);
    celoMentoProvider = module.get<CeloMentoProvider>(CeloMentoProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compareFees', () => {
    it('should fetch quotes from both Wise and RonPay', async () => {
      const wiseQuote = {
        fee: 5.0,
        exchangeRate: 1500,
        recipientReceives: 142500, // 100 USD * 1500 - fees
        totalCost: 105.0,
      };

      const ronpayQuote = {
        fee: 0.15,
        exchangeRate: 1520,
        recipientReceives: 151985, // Better rate
        totalCost: 100.15,
      };

      jest.spyOn(wiseProvider, 'getQuote').mockResolvedValue(wiseQuote);
      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('USD', 'NGN', 100);

      expect(wiseProvider.getQuote).toHaveBeenCalledWith('USD', 'NGN', 100);
      expect(celoMentoProvider.getQuote).toHaveBeenCalledWith('USD', 'NGN', 100);
      expect(result.wise).toBeDefined();
      expect(result.ronpay).toBeDefined();
    });

    it('should calculate savings correctly', async () => {
      const wiseQuote = {
        fee: 5.0,
        totalCost: 105.0,
        recipientReceives: 142500,
        exchangeRate: 1500,
      };

      const ronpayQuote = {
        fee: 0.15,
        totalCost: 100.15,
        recipientReceives: 151985,
        exchangeRate: 1520,
      };

      jest.spyOn(wiseProvider, 'getQuote').mockResolvedValue(wiseQuote);
      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('USD', 'NGN', 100);

      // Savings = Wise total cost - RonPay total cost
      const expectedSavings = 105.0 - 100.15; // $4.85
      expect(result.savings).toBeCloseTo(expectedSavings, 2);
      
      // Savings percentage
      const expectedPercentage = (expectedSavings / 105.0) * 100; // ~4.6%
      expect(result.savingsPercentage).toBeCloseTo(expectedPercentage, 1);
    });

    it('should show RonPay as significantly cheaper', async () => {
      const wiseQuote = {
        fee: 5.0,
        totalCost: 105.0,
        recipientReceives: 142500,
        exchangeRate: 1500,
      };

      const ronpayQuote = {
        fee: 0.15,
        totalCost: 100.15,
        recipientReceives: 151985,
        exchangeRate: 1520,
      };

      jest.spyOn(wiseProvider, 'getQuote').mockResolvedValue(wiseQuote);
      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('USD', 'NGN', 100);

      expect(result.ronpay.totalCost).toBeLessThan(result.wise.totalCost);
      expect(result.savings).toBeGreaterThan(0);
      expect(result.savingsPercentage).toBeGreaterThan(0);
      expect(result.cheaper).toBe('ronpay');
    });

    it('should handle USD → KES corridor', async () => {
      const wiseQuote = {
        fee: 4.5,
        totalCost: 104.5,
        recipientReceives: 12900,
        exchangeRate: 130,
      };

      const ronpayQuote = {
        fee: 0.12,
        totalCost: 100.12,
        recipientReceives: 13100,
        exchangeRate: 131,
      };

      jest.spyOn(wiseProvider, 'getQuote').mockResolvedValue(wiseQuote);
      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('USD', 'KES', 100);

      expect(result).toBeDefined();
      expect(result.corridor).toBe('USD-KES');
      expect(result.savings).toBeGreaterThan(0);
    });

    it('should handle reverse corridors (NGN → USD)', async () => {
      const wiseQuote = {
        fee: 750, // 750 NGN ~= $0.50
        totalCost: 151500, // 150750 + fee
        recipientReceives: 99.5,
        exchangeRate: 0.00066,
      };

      const ronpayQuote = {
        fee: 15, // 15 NGN ~= $0.01
        totalCost: 150015,
        recipientReceives: 99.99,
        exchangeRate: 0.00067,
      };

      jest.spyOn(wiseProvider, 'getQuote').mockResolvedValue(wiseQuote);
      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('NGN', 'USD', 150000);

      expect(result.ronpay.totalCost).toBeLessThan(result.wise.totalCost);
      expect(result.savings).toBeGreaterThan(0);
    });

    it('should use mock data when Wise API unavailable', async () => {
      jest.spyOn(wiseProvider, 'getQuote').mockRejectedValue(
        new Error('API unavailable')
      );

      const ronpayQuote = {
        fee: 0.15,
        totalCost: 100.15,
        recipientReceives: 151985,
        exchangeRate: 1520,
      };

      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('USD', 'NGN', 100);

      // Should still return comparison with mock Wise data
      expect(result).toBeDefined();
      expect(result.wise).toBeDefined();
      expect(result.ronpay).toBeDefined();
      expect(result.wise.provider).toBe('Wise (Mock)');
    });

    it('should handle unsupported corridors', async () => {
      jest.spyOn(wiseProvider, 'getQuote').mockRejectedValue(
        new Error('Unsupported corridor')
      );
      jest.spyOn(celoMentoProvider, 'getQuote').mockRejectedValue(
        new Error('Unsupported corridor')
      );

      await expect(
        service.compareFees('USD', 'EUR', 100)
      ).rejects.toThrow();
    });

    it('should handle large amounts (>$1000)', async () => {
      const wiseQuote = {
        fee: 15.0,
        totalCost: 1015.0,
        recipientReceives: 1500000,
        exchangeRate: 1500,
      };

      const ronpayQuote = {
        fee: 1.5,
        totalCost: 1001.5,
        recipientReceives: 1520000,
        exchangeRate: 1520,
      };

      jest.spyOn(wiseProvider, 'getQuote').mockResolvedValue(wiseQuote);
      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('USD', 'NGN', 1000);

      expect(result.savings).toBeGreaterThan(10); // Significant savings
      expect(result.ronpay.totalCost).toBe(1001.5);
    });

    it('should handle small amounts (<$10)', async () => {
      const wiseQuote = {
        fee: 1.0, // Minimum fee
        totalCost: 11.0,
        recipientReceives: 14250,
        exchangeRate: 1500,
      };

      const ronpayQuote = {
        fee: 0.015,
        totalCost: 10.015,
        recipientReceives: 15198.5,
        exchangeRate: 1520,
      };

      jest.spyOn(wiseProvider, 'getQuote').mockResolvedValue(wiseQuote);
      jest.spyOn(celoMentoProvider, 'getQuote').mockResolvedValue(ronpayQuote);

      const result = await service.compareFees('USD', 'NGN', 10);

      expect(result.savingsPercentage).toBeGreaterThan(5);
    });
  });

  describe('getSupportedCorridors', () => {
    it('should return list of supported corridors', async () => {
      const mockCorridors = [
        { from: 'USD', to: 'NGN', name: 'United States → Nigeria' },
        { from: 'USD', to: 'KES', name: 'United States → Kenya' },
      ];

      jest.spyOn(celoMentoProvider, 'getSupportedCorridors').mockResolvedValue(mockCorridors);

      const result = await service.getSupportedCorridors();

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result).toEqual(expect.arrayContaining(mockCorridors));
    });

    it('should include major remittance corridors', async () => {
      const mockCorridors = [
        { from: 'USD', to: 'NGN', name: 'United States → Nigeria' },
        { from: 'USD', to: 'KES', name: 'United States → Kenya' },
      ];

      jest.spyOn(celoMentoProvider, 'getSupportedCorridors').mockResolvedValue(mockCorridors);

      const result = await service.getSupportedCorridors();

      const hasUsdNgn = result.some(c => c.from === 'USD' && c.to === 'NGN');
      const hasUsdKes = result.some(c => c.from === 'USD' && c.to === 'KES');

      expect(hasUsdNgn).toBe(true);
      expect(hasUsdKes).toBe(true);
    });
  });

  describe('Provider Selection', () => {
    it('should execute provider calls in parallel', async () => {
      const wiseDelay = 100;
      const ronpayDelay = 50;

      jest.spyOn(wiseProvider, 'getQuote').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          fee: 5.0,
          totalCost: 105.0,
          recipientReceives: 142500,
          exchangeRate: 1500,
        }), wiseDelay))
      );

      jest.spyOn(celoMentoProvider, 'getQuote').mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          fee: 0.15,
          totalCost: 100.15,
          recipientReceives: 151985,
          exchangeRate: 1520,
        }), ronpayDelay))
      );

      const startTime = Date.now();
      await service.compareFees('USD', 'NGN', 100);
      const duration = Date.now() - startTime;

      // Should complete in ~max(wiseDelay, ronpayDelay), not sum
      expect(duration).toBeLessThan(wiseDelay + ronpayDelay);
    });
  });
});
