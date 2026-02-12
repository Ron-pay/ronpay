import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { getQueueToken } from '@nestjs/bull';

describe('SchedulerService', () => {
  let service: SchedulerService;

  const mockQueue = {
    add: jest.fn(),
    getRepeatableJobs: jest.fn(),
    removeRepeatableByKey: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: getQueueToken('payments'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
