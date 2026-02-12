import { Test, TestingModule } from '@nestjs/testing';
import { VtpassService } from './vtpass.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { TransactionsService } from '../transactions/transactions.service';

describe('VtpassService', () => {
  let service: VtpassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VtpassService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'VTPASS_BASE_URL') return 'https://sandbox.vtpass.com/api';
              return 'mock-key';
            }),
          },
        },
        {
          provide: TransactionsService,
          useValue: {
            create: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VtpassService>(VtpassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
