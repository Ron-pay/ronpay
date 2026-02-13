import { Module } from '@nestjs/common';
import { FeesService } from './fees.service';
import { FeesController } from './fees.controller';
import { WiseProvider } from './providers/wise.provider';
import { CeloMentoProvider } from './providers/celo-mento.provider';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [BlockchainModule],
  controllers: [FeesController],
  providers: [FeesService, WiseProvider, CeloMentoProvider],
  exports: [FeesService],
})
export class FeesModule {}
