import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { TwilioProvider } from './providers/twilio.provider';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let twilioProvider: TwilioProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: TwilioProvider,
          useValue: {
            sendSms: jest.fn(),
            sendWhatsApp: jest.fn(),
            isEnabled: jest.fn().mockReturnValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    twilioProvider = module.get<TwilioProvider>(TwilioProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPaymentConfirmation', () => {
    it('should send WhatsApp notification', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockResolvedValue({
        sid: 'SM123',
        status: 'sent',
      } as any);

      await service.sendPaymentConfirmation({
        toPhone: '+2348012345678',
        amount: 100,
        currency: 'USDm',
        txHash: '0xabc123',
        language: 'en',
        savings: 2.5,
      });

      expect(twilioProvider.sendWhatsApp).toHaveBeenCalled();
      expect(twilioProvider.sendSms).not.toHaveBeenCalled();
    });

    it('should fallback to SMS when WhatsApp fails', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockRejectedValue(
        new Error('WhatsApp unavailable')
      );
      jest.spyOn(twilioProvider, 'sendSms').mockResolvedValue({
        sid: 'SM456',
        status: 'sent',
      } as any);

      await service.sendPaymentConfirmation({
        toPhone: '+2348012345678',
        amount: 100,
        currency: 'USDm',
        txHash: '0xabc123',
        language: 'en',
      });

      expect(twilioProvider.sendWhatsApp).toHaveBeenCalled();
      expect(twilioProvider.sendSms).toHaveBeenCalled(); // Fallback
    });

    it('should use correct English template', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockResolvedValue({} as any);

      await service.sendPaymentConfirmation({
        toPhone: '+2348012345678',
        amount: 100,
        currency: 'USDm',
        txHash: '0xabc123',
        language: 'en',
        savings: 2.5,
      });

      const call = jest.mocked(twilioProvider.sendWhatsApp).mock.calls[0];
      const message = call[1];

      expect(message).toContain('✅');
      expect(message).toContain('100');
      expect(message).toContain('USDm');
      expect(message).toContain('$2.50'); // Savings
      expect(message).toContain('0xabc123');
    });

    it('should use correct Spanish template', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockResolvedValue({} as any);

      await service.sendPaymentConfirmation({
        toPhone: '+34612345678',
        amount: 100,
        currency: 'USDm',
        txHash: '0xdef456',
        language: 'es',
        savings: 3.0,
      });

      const call = jest.mocked(twilioProvider.sendWhatsApp).mock.calls[0];
      const message = call[1];

      expect(message).toContain('✅');
      expect(message).toContain('Pago enviado'); // Spanish
      expect(message).toContain('$3.00');
    });

    it('should use correct Portuguese template', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockResolvedValue({} as any);

      await service.sendPaymentConfirmation({
        toPhone: '+5511987654321',
        amount: 50,
        currency: 'USDm',
        txHash: '0xghi789',
        language: 'pt',
        savings: 1.5,
      });

      const call = jest.mocked(twilioProvider.sendWhatsApp).mock.calls[0];
      const message = call[1];

      expect(message).toContain('✅');
      expect(message).toContain('Pagamento enviado'); // Portuguese
    });

    it('should use correct French template', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockResolvedValue({} as any);

      await service.sendPaymentConfirmation({
        toPhone: '+33612345678',
        amount: 75,
        currency: 'USDm',
        txHash: '0xjkl012',
        language: 'fr',
        savings: 2.0,
      });

      const call = jest.mocked(twilioProvider.sendWhatsApp).mock.calls[0];
      const message = call[1];

      expect(message).toContain('✅');
      expect(message).toContain('Paiement envoyé'); // French
    });

    it('should include transaction explorer link', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockResolvedValue({} as any);

      await service.sendPaymentConfirmation({
        toPhone: '+2348012345678',
        amount: 100,
        currency: 'USDm',
        txHash: '0xabc123def456',
        language: 'en',
      });

      const call = jest.mocked(twilioProvider.sendWhatsApp).mock.calls[0];
      const message = call[1];

      expect(message).toContain('celoscan.io');
      expect(message).toContain('0xabc123def456');
    });

    it('should not throw when notification fails', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockRejectedValue(
        new Error('WhatsApp failed')
      );
      jest.spyOn(twilioProvider, 'sendSms').mockRejectedValue(
        new Error('SMS failed')
      );

      // Should not throw
      await expect(
        service.sendPaymentConfirmation({
          toPhone: '+2348012345678',
          amount: 100,
          currency: 'USDm',
          txHash: '0xabc123',
          language: 'en',
        })
      ).resolves.not.toThrow();
    });
  });

  describe('sendPaymentFailed', () => {
    it('should send failure notification in English', async () => {
      jest.spyOn(twilioProvider, 'sendSms').mockResolvedValue({} as any);

      await service.sendPaymentFailed(
        '+2348012345678',
        100,
        'USDm',
        'en'
      );

      const call = jest.mocked(twilioProvider.sendSms).mock.calls[0];
      const message = call[1];

      expect(message).toContain('❌');
      expect(message).toContain('failed');
      expect(message).toContain('100');
      expect(message).toContain('USDm');
    });

    it('should send failure notification in Spanish', async () => {
      jest.spyOn(twilioProvider, 'sendSms').mockResolvedValue({} as any);

      await service.sendPaymentFailed(
        '+34612345678',
        100,
        'USDm',
        'es'
      );

      const call = jest.mocked(twilioProvider.sendSms).mock.calls[0];
      const message = call[1];

      expect(message).toContain('❌');
      expect(message).toContain('falló'); // Spanish for "failed"
    });
  });

  describe('sendNotification', () => {
    it('should send SMS when channel is "sms"', async () => {
      jest.spyOn(twilioProvider, 'sendSms').mockResolvedValue({} as any);

      await service.sendNotification({
        toPhone: '+2348012345678',
        message: 'Test message',
        channel: 'sms',
      });

      expect(twilioProvider.sendSms).toHaveBeenCalledWith(
        '+2348012345678',
        'Test message'
      );
    });

    it('should send WhatsApp when channel is "whatsapp"', async () => {
      jest.spyOn(twilioProvider, 'sendWhatsApp').mockResolvedValue({} as any);

      await service.sendNotification({
        toPhone: '+2348012345678',
        message: 'Test message',
        channel: 'whatsapp',
      });

      expect(twilioProvider.sendWhatsApp).toHaveBeenCalledWith(
        '+2348012345678',
        'Test message'
      );
    });

    it('should default to SMS when channel not specified', async () => {
      jest.spyOn(twilioProvider, 'sendSms').mockResolvedValue({} as any);

      await service.sendNotification({
        toPhone: '+2348012345678',
        message: 'Test message',
      });

      expect(twilioProvider.sendSms).toHaveBeenCalled();
    });
  });

  describe('isEnabled', () => {
    it('should return true when Twilio is configured', () => {
      jest.spyOn(twilioProvider, 'isEnabled').mockReturnValue(true);

      expect(service.isEnabled()).toBe(true);
    });

    it('should return false when Twilio is not configured', () => {
      jest.spyOn(twilioProvider, 'isEnabled').mockReturnValue(false);

      expect(service.isEnabled()).toBe(false);
    });
  });
});
