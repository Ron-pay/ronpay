import { Test, TestingModule } from '@nestjs/testing';
import { VtpassController } from './vtpass.controller';
import { VtpassService } from './vtpass.service';

describe('VtpassController', () => {
  let controller: VtpassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VtpassController],
      providers: [
        {
          provide: VtpassService,
          useValue: {
            getServices: jest.fn(),
            getVariations: jest.fn(),
            verifyMerchant: jest.fn(),
            purchaseProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<VtpassController>(VtpassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
