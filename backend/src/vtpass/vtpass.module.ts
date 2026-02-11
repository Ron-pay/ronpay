import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { VtpassService } from './vtpass.service';
import { VtpassController } from './vtpass.controller';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    TransactionsModule, 
  ],
  providers: [VtpassService],
  controllers: [VtpassController],
  exports: [VtpassService],
})
export class VtpassModule {}
