import { Module } from '@nestjs/common';
import { CeloService } from './celo.service';

@Module({
  providers: [CeloService],
  exports: [CeloService],
})
export class BlockchainModule {}
