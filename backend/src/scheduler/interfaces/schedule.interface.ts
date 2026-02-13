/**
 * Schedule-related type definitions
 */

export type ScheduleFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'monthly_5th'
  | 'monthly_10th'
  | 'monthly_15th'
  | 'monthly_20th'
  | 'monthly_25th'
  | 'monthly_last'
  | 'custom';

export type ScheduleStatus = 'active' | 'paused' | 'failed' | 'cancelled';

export type ScheduleType = 'payment' | 'bill';

export interface ScheduleMetadata {
  scheduleId: string;
  retryCount: number;
  maxRetries: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  failureReason?: string;
  isPaused: boolean;
  pausedUntil?: Date;
  language?: string;
}

export interface ScheduleDetails {
  id: string;
  type: ScheduleType;
  walletAddress: string;
  recipient?: string;
  amount: number;
  currency: string;
  frequency: ScheduleFrequency;
  customCron?: string;
  customDayOfMonth?: number;
  status: ScheduleStatus;
  nextExecution?: Date;
  lastExecution?: Date;
  metadata: ScheduleMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetryConfig {
  maxRetries: number;
  delays: number[]; // in milliseconds
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delays: [
    1 * 60 * 60 * 1000,  // 1 hour
    6 * 60 * 60 * 1000,  // 6 hours
    24 * 60 * 60 * 1000, // 24 hours
  ],
};
