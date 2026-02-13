import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { PaymentProcessor } from './payment.processor';
import { PaymentsModule } from '../payments/payments.module';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'payments',
    }),
    PaymentsModule,
    BlockchainModule,
    NotificationsModule,
  ],
  providers: [SchedulerService, PaymentProcessor],
  controllers: [SchedulerController],
  exports: [SchedulerService],
})
export class SchedulerModule {}
