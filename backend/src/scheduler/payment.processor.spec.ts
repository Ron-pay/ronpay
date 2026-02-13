import { Test, TestingModule } from '@nestjs/testing';
import { PaymentProcessor } from './payment.processor';
import { PaymentsService } from '../payments/payments.service';
import { MentoService } from '../blockchain/mento.service';
import { CeloService } from '../blockchain/celo.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;
  let celoService: CeloService;
  let notificationsService: NotificationsService;

  const mockJob = {
    id: 'job-123',
    data: {
      recipient: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      amount: 100,
      currency: 'USDm',
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      frequency: 'monthly_15th',
      metadata: {
        scheduleId: 'sched-123',
        retryCount: 0,
        maxRetries: 3,
        isPaused: false,
      },
    },
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProcessor,
        {
          provide: PaymentsService,
          useValue: {},
        },
        {
          provide: MentoService,
          useValue: {
            getSwapQuote: jest.fn(),
          },
        },
        {
          provide: CeloService,
          useValue: {
            getAllBalances: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendPaymentConfirmation: jest.fn(),
            sendPaymentFailed: jest.fn(),
            sendNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<PaymentProcessor>(PaymentProcessor);
    celoService = module.get<CeloService>(CeloService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  describe('Balance Checks', () => {
    it('should execute payment when balance is sufficient', async () => {
      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '150.00', // Sufficient
      });

      jest.spyOn(notificationsService, 'sendPaymentConfirmation').mockResolvedValue();

      const result = await processor.handleRecurringPayment(mockJob as any);

      expect(result.status).toBe('success');
      expect(notificationsService.sendPaymentConfirmation).toHaveBeenCalled();
    });

    it('should retry when balance is insufficient', async () => {
      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '50.00', // Insufficient (needs 100)
      });

      jest.spyOn(notificationsService, 'sendPaymentFailed').mockResolvedValue();

      const result = await processor.handleRecurringPayment(mockJob as any);

      expect(result.status).toBe('insufficient_balance');
      expect(result.retryCount).toBe(1);
      expect(notificationsService.sendPaymentFailed).toHaveBeenCalled();
    });

    it('should use exponential backoff for retries', async () => {
      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '50.00', // Insufficient
      });

      // First retry
      await processor.handleRecurringPayment(mockJob as any);
      expect(mockJob.data.metadata.retryCount).toBe(1);

      // Second retry
      mockJob.data.metadata.retryCount = 1;
      await processor.handleRecurringPayment(mockJob as any);
      expect(mockJob.data.metadata.retryCount).toBe(2);

      // Third retry
      mockJob.data.metadata.retryCount = 2;
      await processor.handleRecurringPayment(mockJob as any);
      expect(mockJob.data.metadata.retryCount).toBe(3);
    });

    it('should pause after 3 failed attempts', async () => {
      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '50.00', // Always insufficient
      });

mockJob.data.metadata.retryCount = 3; // Max retries reached

      await processor.handleRecurringPayment(mockJob as any);

      expect(mockJob.update).toHaveBeenCalled();
      const updatedData = mockJob.update.mock.calls[0][0];
      expect(updatedData.metadata.isPaused).toBe(true);
      expect(updatedData.metadata.failureReason).toBe('max_retries_exceeded');
    });
  });

  describe('Pause/Resume', () => {
    it('should skip execution when paused', async () => {
      mockJob.data.metadata.isPaused = true;

      const result = await processor.handleRecurringPayment(mockJob as any);

      expect(result.status).toBe('paused');
      expect(celoService.getAllBalances).not.toHaveBeenCalled();
    });

    it('should auto-resume after pause period expires', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      mockJob.data.metadata.isPaused = true;
      mockJob.data.metadata.pausedUntil = yesterday;

      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '150.00',
      });

      await processor.handleRecurringPayment(mockJob as any);

      // Should have auto-resumed and executed
      expect(mockJob.update).toHaveBeenCalled();
      const updatedData = mockJob.update.mock.calls[0][0];
      expect(updatedData.metadata.isPaused).toBe(false);
      expect(updatedData.metadata.pausedUntil).toBeUndefined();
    });

    it('should not auto-resume if pause period not expired', async () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      mockJob.data.metadata.isPaused = true;
      mockJob.data.metadata.pausedUntil = tomorrow;

      const result = await processor.handleRecurringPayment(mockJob as any);

      expect(result.status).toBe('paused');
      expect(celoService.getAllBalances).not.toHaveBeenCalled();
    });
  });

  describe('Notifications', () => {
    it('should send success notification with correct language', async () => {
      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '150.00',
      });

      mockJob.data.metadata.language = 'es';

      await processor.handleRecurringPayment(mockJob as any);

      expect(notificationsService.sendPaymentConfirmation).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'es',
        })
      );
    });

    it('should send failure notification on insufficient balance', async () => {
      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '50.00',
      });

      await processor.handleRecurringPayment(mockJob as any);

      expect(notificationsService.sendPaymentFailed).toHaveBeenCalled();
    });

    it('should not fail payment execution if notification fails', async () => {
      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        USDm: '150.00',
      });

      jest.spyOn(notificationsService, 'sendPaymentConfirmation').mockRejectedValue(
        new Error('Notification failed')
      );

      const result = await processor.handleRecurringPayment(mockJob as any);

      // Payment should still succeed
      expect(result.status).toBe('success');
    });
  });

  describe('Currency Handling', () => {
    it('should check balance in correct currency', async () => {
      mockJob.data.currency = 'NGNm';
      mockJob.data.amount = 150000;

      jest.spyOn(celoService, 'getAllBalances').mockResolvedValue({
        NGNm: '200000.00', // Sufficient NGN
      });

      await processor.handleRecurringPayment(mockJob as any);

      expect(celoService.getAllBalances).toHaveBeenCalledWith(
        mockJob.data.walletAddress
      );
    });
  });
});
