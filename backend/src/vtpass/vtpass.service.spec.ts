import { Test, TestingModule } from '@nestjs/testing';
import { VtpassService } from './vtpass.service';

describe('VtpassService', () => {
  let service: VtpassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VtpassService],
    }).compile();

    service = module.get<VtpassService>(VtpassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
