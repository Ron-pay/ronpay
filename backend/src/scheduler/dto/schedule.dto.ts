import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, Min, Max, IsBoolean } from 'class-validator';
import { ScheduleFrequency } from '../interfaces/schedule.interface';
import { SupportedLanguage } from '../../ai/language-detection';

/**
 * DTO for creating a new recurring payment schedule
 */
export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly', 'monthly_5th', 'monthly_10th', 'monthly_15th', 'monthly_20th', 'monthly_25th', 'monthly_last', 'custom'])
  frequency: ScheduleFrequency;

  @IsOptional()
  @IsString()
  customCron?: string; // Required if frequency is 'custom'

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  customDayOfMonth?: number; // For custom day of month

  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsOptional()
  @IsString()
  language?: SupportedLanguage;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number; // Default: 3
}

/**
 * DTO for creating a recurring bill payment schedule
 */
export class CreateBillScheduleDto {
  @IsString()
  @IsNotEmpty()
  serviceID: string;

  @IsString()
  @IsNotEmpty()
  billersCode: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly', 'monthly_5th', 'monthly_10th', 'monthly_15th', 'monthly_20th', 'monthly_25th', 'monthly_last', 'custom'])
  frequency: ScheduleFrequency;

  @IsOptional()
  @IsString()
  customCron?: string;

  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsOptional()
  @IsString()
  language?: SupportedLanguage;
}

/**
 * DTO for updating an existing schedule
 */
export class UpdateScheduleDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'biweekly', 'monthly', 'monthly_5th', 'monthly_10th', 'monthly_15th', 'monthly_20th', 'monthly_25th', 'monthly_last', 'custom'])
  frequency?: ScheduleFrequency;

  @IsOptional()
  @IsString()
  customCron?: string;

  @IsOptional()
  @IsBoolean()
  isPaused?: boolean;

  @IsOptional()
  @IsString()
  recipient?: string;
}

/**
 * DTO for pausing a schedule
 */
export class PauseScheduleDto {
  @IsOptional()
  @IsString()
  pausedUntil?: string; // ISO date string - if not provided, pause indefinitely
}
