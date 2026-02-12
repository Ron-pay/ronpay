import { MentoService } from './mento.service';
import { IdentityService } from './identity.service';
import { CeloService } from './celo.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [CeloService, MentoService, IdentityService],
  exports: [CeloService, MentoService, IdentityService],
})
export class BlockchainModule {}
