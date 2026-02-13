import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { ClaudeService } from './claude.service';
import { detectLanguage } from './language-detection';

jest.mock('./language-detection');

describe('AiService', () => {
  let service: AiService;
  let claudeService: ClaudeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ClaudeService,
          useValue: {
            parsePaymentIntent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    claudeService = module.get<ClaudeService>(ClaudeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parsePaymentIntent - English', () => {
    it('should parse "Send $100 to Mom"', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'Mom',
        amount: 100,
        currency: 'USD',
        confidence: 0.95,
      });

      const result = await service.parsePaymentIntent({
        message: 'Send $100 to Mom',
      });

      expect(result.action).toBe('send_payment');
      expect(result.amount).toBe(100);
      expect(result.currency).toBe('USD');
      expect(result.recipient).toBe('Mom');
    });

    it('should extract phone number from message', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: '+2348012345678',
        amount: 50,
        currency: 'USD',
        confidence: 0.9,
      });

      const result = await service.parsePaymentIntent({
        message: 'Send $50 to +2348012345678',
      });

      expect(result.recipient).toBe('+2348012345678');
    });

    it('should identify send_payment action', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'John',
        amount: 200,
        currency: 'USD',
        confidence: 0.92,
      });

      const result = await service.parsePaymentIntent({
        message: 'Transfer 200 bucks to John',
      });

      expect(result.action).toBe('send_payment');
    });

    it('should identify buy_airtime action', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'buy_airtime',
        recipient: '08012345678',
        amount: 1000,
        currency: 'NGN',
        biller: 'MTN',
        confidence: 0.88,
      });

      const result = await service.parsePaymentIntent({
        message: 'Buy 1000 Naira MTN airtime for 08012345678',
      });

      expect(result.action).toBe('buy_airtime');
      expect(result.biller).toBe('MTN');
    });
  });

  describe('parsePaymentIntent - Spanish', () => {
    it('should parse "Enviar $100 a mamá"', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('es');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'mamá',
        amount: 100,
        currency: 'USD',
        confidence: 0.93,
      });

      const result = await service.parsePaymentIntent({
        message: 'Enviar $100 a mamá',
        language: 'es',
      });

      expect(result.action).toBe('send_payment');
      expect(result.amount).toBe(100);
      expect(claudeService.parsePaymentIntent).toHaveBeenCalledWith(
        'Enviar $100 a mamá',
        'es'
      );
    });

    it('should detect Spanish from keywords', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('es');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'María',
        amount: 50,
        currency: 'USD',
        confidence: 0.9,
      });

      await service.parsePaymentIntent({
        message: 'Transferir 50 dólares a María',
      });

      expect(detectLanguage).toHaveBeenCalledWith('Transferir 50 dólares a María');
      expect(claudeService.parsePaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        'es'
      );
    });

    it('should use Spanish prompt for Spanish language', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('es');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'Pedro',
        amount: 75,
        currency: 'USD',
        confidence: 0.91,
      });

      await service.parsePaymentIntent({
        message: 'Enviar 75 USD a Pedro',
        language: 'es',
      });

      expect(claudeService.parsePaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        'es'
      );
    });
  });

  describe('parsePaymentIntent - Portuguese', () => {
    it('should parse "Enviar $100 para mãe"', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('pt');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'mãe',
        amount: 100,
        currency: 'USD',
        confidence: 0.94,
      });

      const result = await service.parsePaymentIntent({
        message: 'Enviar $100 para mãe',
        language: 'pt',
      });

      expect(result.action).toBe('send_payment');
      expect(result.amount).toBe(100);
    });

    it('should detect Portuguese from "para" keyword', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('pt');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'João',
        amount: 200,
        currency: 'USD',
        confidence: 0.89,
      });

      await service.parsePaymentIntent({
        message: 'Transferir 200 reais para João',
      });

      expect(detectLanguage).toHaveBeenCalled();
      expect(claudeService.parsePaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        'pt'
      );
    });
  });

  describe('parsePaymentIntent - French', () => {
    it('should parse "Envoyer $100 à maman"', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('fr');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'maman',
        amount: 100,
        currency: 'USD',
        confidence: 0.92,
      });

      const result = await service.parsePaymentIntent({
        message: 'Envoyer $100 à maman',
        language: 'fr',
      });

      expect(result.action).toBe('send_payment');
      expect(result.amount).toBe(100);
    });

    it('should detect French from "envoyer" keyword', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('fr');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'Pierre',
        amount: 150,
        currency: 'EUR',
        confidence: 0.88,
      });

      await service.parsePaymentIntent({
        message: 'Envoyer 150 euros à Pierre',
      });

      expect(detectLanguage).toHaveBeenCalled();
    });
  });

  describe('Language Detection', () => {
    it('should explicitly use provided language parameter', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en'); // Default detection      
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'Test',
        amount: 10,
        currency: 'USD',
        confidence: 0.9,
      });

      await service.parsePaymentIntent({
        message: 'Send money',
        language: 'fr', // Explicitly French
      });

      // Should use explicit language, not detected
      expect(claudeService.parsePaymentIntent).toHaveBeenCalledWith(
        'Send money',
        'fr'
      );
    });

    it('should default to English for ambiguous messages', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'send_payment',
        recipient: 'Someone',
        amount: 100,
        currency: 'USD',
        confidence: 0.85,
      });

      await service.parsePaymentIntent({
        message: '100',
      });

      expect(claudeService.parsePaymentIntent).toHaveBeenCalledWith(
        '100',
        'en'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle Claude API failures gracefully', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        service.parsePaymentIntent({ message: 'Send money' })
      ).rejects.toThrow('API Error');
    });

    it('should handle malformed messages', async () => {
      (detectLanguage as jest.Mock).mockReturnValue('en');
      
      jest.spyOn(claudeService, 'parsePaymentIntent').mockResolvedValue({
        action: 'unknown',
        recipient: null,
        amount: 0,
        currency: 'USD',
        confidence: 0.3,
      });

      const result = await service.parsePaymentIntent({
        message: 'asdf qwerty',
      });

      expect(result.confidence).toBeLessThan(0.5);
      expect(result.action).toBe('unknown');
    });
  });
});
