import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { PaymentProcessor } from './payment.processor';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payments',
    }),
    forwardRef(() => PaymentsModule),
  ],
  providers: [SchedulerService, PaymentProcessor],
  controllers: [SchedulerController],
  exports: [SchedulerService],
})
export class SchedulerModule {}
