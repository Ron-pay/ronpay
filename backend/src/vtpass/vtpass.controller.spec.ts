import { Test, TestingModule } from '@nestjs/testing';
import { VtpassController } from './vtpass.controller';

describe('VtpassController', () => {
  let controller: VtpassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VtpassController],
    }).compile();

    controller = module.get<VtpassController>(VtpassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
