import { IsString, IsNotEmpty, IsOptional, IsEthereumAddress, IsNumber } from 'class-validator';

export class NaturalLanguagePaymentDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  senderAddress: string;
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
}
