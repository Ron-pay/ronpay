import { Module, Global } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { AiModule } from '../ai/ai.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { VtpassModule } from '../vtpass/vtpass.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Global()
@Module({
  imports: [BlockchainModule, AiModule, TransactionsModule, VtpassModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
