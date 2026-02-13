
import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';
import { ConfigService } from '@nestjs/config';

// Mock GoogleGenAI
const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
  };
});

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock successful response by default
    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        action: 'send_payment',
        recipient: '0x123',
        amount: 10,
        currency: 'cUSD',
        confidence: 0.95
      }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('fake-api-key'),
          },
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should parse payment intent with English (default)', async () => {
    await service.parsePaymentIntent('Send 10 cUSD to Bob');
    
    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.model).toBe('gemini-2.0-flash');
    expect(callArgs.contents).toContain('You are a payment intent parser'); // English prompt part
    expect(callArgs.contents).toContain('Send 10 cUSD to Bob');
  });

  it('should parse payment intent with Spanish when specified', async () => {
    await service.parsePaymentIntent('Enviar 10 cUSD a Bob', 'es');
    
    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('Eres un analizador de intenciones de pago'); // Spanish prompt part
    expect(callArgs.contents).toContain('Enviar 10 cUSD a Bob');
  });

  it('should detect language if not provided', async () => {
    await service.parsePaymentIntent('Enviar 10 cUSD a mi cuenta'); // Spanish text with 'cuenta' (vs 'conta' in PT)
    
    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0][0];
    expect(callArgs.contents).toContain('Eres un analizador de intenciones de pago'); // Should auto-detect Spanish
  });
});
