import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { SupportedLanguage } from '../../ai/language-detection';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  toPhone: string; // E.164 format: +2348012345678

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  @IsString()
  channel?: 'sms' | 'whatsapp'; // Default: sms
}

export class PaymentConfirmationDto {
  @IsString()
  @IsNotEmpty()
  toPhone: string;

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
  language?: SupportedLanguage; // Default: en

  @IsOptional()
  @IsNumber()
  savings?: number; // Savings vs traditional providers
}

export class RecurringReminderDto {
  @IsString()
  @IsNotEmpty()
  toPhone: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  nextExecutionDate: string;

  @IsOptional()
  @IsString()
  language?: SupportedLanguage;
}
