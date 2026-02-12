import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClaudeService } from './../src/ai/claude.service';
import { CeloService } from './../src/blockchain/celo.service';
import { IdentityService } from './../src/blockchain/identity.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let claudeService = {
    parsePaymentIntent: jest.fn().mockResolvedValue({
      action: 'send_payment',
      recipient: '0x123...456',
      amount: 10,
      currency: 'cUSD',
      confidence: 0.95
    })
  };

  let celoService = {
    isValidAddress: jest.fn().mockReturnValue(true),
    buildPaymentTransaction: jest.fn().mockResolvedValue({ to: '0x123...456', value: '100', data: '0x' }),
    waitForTransaction: jest.fn().mockResolvedValue({ status: 'success' }),
    getAllBalances: jest.fn().mockResolvedValue({ cUSD: '100.00' }),
    getSupportedTokens: jest.fn().mockReturnValue({ cUSD: '0x...' })
  };

  let identityService = {
    resolvePhoneNumber: jest.fn().mockResolvedValue('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ClaudeService).useValue(claudeService)
      .overrideProvider(CeloService).useValue(celoService)
      .overrideProvider(IdentityService).useValue(identityService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/payments/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/payments/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.minipayCompatible).toBe(true);
      });
  });

  it('/payments/parse-intent (POST)', () => {
    return request(app.getHttpServer())
      .post('/payments/parse-intent')
      .send({ message: 'Send 10 cUSD to 0x123...456', senderAddress: '0xUser' })
      .expect(201)
      .expect((res) => {
        expect(res.body.intent.action).toBe('send_payment');
        expect(res.body.parsedCommand.amount).toBe(10);
        expect(res.body.transaction).toBeDefined();
      });
  });
});
