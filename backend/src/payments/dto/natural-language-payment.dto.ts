import { IsString, IsNotEmpty, IsOptional, IsEthereumAddress, IsNumber } from 'class-validator';

export class NaturalLanguagePaymentDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  senderAddress: string;

  @IsOptional()
  @IsString()
  language?: 'en' | 'es' | 'pt' | 'fr'; // Optional: auto-detect if not provided
}

export class ExecutePaymentDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  fromAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  toAddress: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  txHash: string;

  @IsOptional()
  @IsString()
  intent?: string;

  @IsOptional()
  @IsString()
  memo?: string;

  // Fields for VTPASS/AI Context
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @IsOptional()
  metadata?: any;
}
