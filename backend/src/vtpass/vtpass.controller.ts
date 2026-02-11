import { Controller, Get, Post, Body, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { VtpassService } from './vtpass.service';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class PurchaseDto {
  @IsString()
  @IsNotEmpty()
  serviceID: string;

  @IsString()
  @IsNotEmpty()
  billersCode: string;

  @IsOptional()
  @IsString()
  variation_code?: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;
}

export class VerifyMerchantDto {
  @IsString()
  @IsNotEmpty()
  serviceID: string;

  @IsString()
  @IsNotEmpty()
  billersCode: string;

  @IsOptional()
  @IsString()
  type?: string;
}

@Controller('vtpass')
export class VtpassController {
  constructor(private readonly vtpassService: VtpassService) {}

  @Get('services')
  async getServices(@Query('identifier') identifier: string) {
    return this.vtpassService.getServices(identifier || 'airtime');
  }

  @Get('variations')
  async getVariations(@Query('serviceID') serviceID: string) {
    return this.vtpassService.getVariations(serviceID);
  }

  @Post('verify')
  async verifyMerchant(@Body() dto: VerifyMerchantDto) {
    return this.vtpassService.verifyMerchant(dto);
  }

  @Post('purchase')
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseProduct(@Body() dto: PurchaseDto) {
    return this.vtpassService.purchaseProduct(dto);
  }
}
