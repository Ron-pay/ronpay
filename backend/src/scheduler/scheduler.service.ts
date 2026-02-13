import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CreateScheduleDto, CreateBillScheduleDto, UpdateScheduleDto, PauseScheduleDto } from './dto/schedule.dto';
import { ScheduleFrequency, ScheduleMetadata, DEFAULT_RETRY_CONFIG, ScheduleDetails } from './interfaces/schedule.interface';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(@InjectQueue('payments') private paymentsQueue: Queue) {}

  /**
   * Schedule a recurring payment
   */
  async schedulePayment(dto: CreateScheduleDto) {
    const scheduleId = `pay-${dto.walletAddress}-${Date.now()}`;
    const cron = this.getCronExpression(dto.frequency, dto.customDayOfMonth, dto.customCron);

    const metadata: ScheduleMetadata = {
      scheduleId,
      retryCount: 0,
      maxRetries: dto.maxRetries || DEFAULT_RETRY_CONFIG.maxRetries,
      isPaused: false,
      language: dto.language,
    };

    const job = await this.paymentsQueue.add(
      'recurring-payment',
      {
        ...dto,
        metadata,
      },
      {
        repeat: { cron },
        jobId: scheduleId,
      },
    );

    this.logger.log(`Scheduled payment ${scheduleId} for ${dto.walletAddress} (${dto.frequency})`);

    return {
      scheduleId,
      jobId: job.id,
      frequency: dto.frequency,
      nextExecution: await this.getNextExecutionTime(cron),
      cron,
    };
  }

  /**
   * Schedule a recurring bill payment
   */
  async scheduleBill(dto: CreateBillScheduleDto) {
    const scheduleId = `bill-${dto.walletAddress}-${Date.now()}`;
    const cron = this.getCronExpression(dto.frequency, undefined, dto.customCron);

    const metadata: ScheduleMetadata = {
      scheduleId,
      retryCount: 0,
      maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
      isPaused: false,
      language: dto.language,
    };

    const job = await this.paymentsQueue.add(
      'recurring-bill',
      {
        ...dto,
        metadata,
      },
      {
        repeat: { cron },
        jobId: scheduleId,
      },
    );

    this.logger.log(`Scheduled bill ${scheduleId} for ${dto.walletAddress} (${dto.frequency})`);

    return {
      scheduleId,
      jobId: job.id,
      frequency: dto.frequency,
      nextExecution: await this.getNextExecutionTime(cron),
      cron,
    };
  }

  /**
   * Get all schedules for a specific wallet address
   */
  async getSchedulesByWallet(walletAddress: string): Promise<ScheduleDetails[]> {
    const repeatableJobs = await this.paymentsQueue.getRepeatableJobs();

    const walletJobs = repeatableJobs.filter(job =>
      job.id && job.id.includes(walletAddress)
    );

    const schedules: ScheduleDetails[] = [];

    for (const job of walletJobs) {
      try {
        if (job.id) {
          const jobData = await this.paymentsQueue.getJob(job.id as any);
          if (jobData && jobData.data) {
            schedules.push(await this.formatScheduleDetails(jobData));
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch job ${job.id}: ${error.message}`);
      }
    }

    return schedules;
  }

  /**
   * Get schedule by ID
   */
  async getScheduleById(scheduleId: string): Promise<ScheduleDetails> {
    const job = await this.paymentsQueue.getJob(scheduleId);

    if (!job) {
      throw new NotFoundException(`Schedule ${scheduleId} not found`);
    }

    return this.formatScheduleDetails(job);
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(scheduleId: string, updates: UpdateScheduleDto) {
    const job = await this.paymentsQueue.getJob(scheduleId);

    if (!job) {
      throw new NotFoundException(`Schedule ${scheduleId} not found`);
    }

    const currentData = job.data;
    const updatedData = {
      ...currentData,
      ...updates,
      metadata: {
        ...currentData.metadata,
        isPaused: updates.isPaused !== undefined ? updates.isPaused : currentData.metadata.isPaused,
      },
    };

    // If frequency changed, need to recreate the job with new CRON
    if (updates.frequency && updates.frequency !== currentData.frequency) {
      await this.cancelSchedule(scheduleId);

      const newCron = this.getCronExpression(updates.frequency, undefined, updates.customCron);

      await this.paymentsQueue.add(
        job.name,
        updatedData,
        {
          repeat: { cron: newCron },
          jobId: scheduleId,
        },
      );

      this.logger.log(`Updated schedule ${scheduleId} with new frequency: ${updates.frequency}`);
    } else {
      // Just update the data
      await job.update(updatedData);
      this.logger.log(`Updated schedule ${scheduleId}`);
    }

    return this.getScheduleById(scheduleId);
  }

  /**
   * Pause a schedule
   */
  async pauseSchedule(scheduleId: string, dto?: PauseScheduleDto) {
    const job = await this.paymentsQueue.getJob(scheduleId);

    if (!job) {
      throw new NotFoundException(`Schedule ${scheduleId} not found`);
    }

    const updatedData = {
      ...job.data,
      metadata: {
        ...job.data.metadata,
        isPaused: true,
        pausedUntil: dto?.pausedUntil ? new Date(dto.pausedUntil) : undefined,
      },
    };

    await job.update(updatedData);
    this.logger.log(`Paused schedule ${scheduleId}${dto?.pausedUntil ? ` until ${dto.pausedUntil}` : ''}`);

    return {
      success: true,
      scheduleId,
      isPaused: true,
      pausedUntil: dto?.pausedUntil,
    };
  }

  /**
   * Resume a paused schedule
   */
  async resumeSchedule(scheduleId: string) {
    const job = await this.paymentsQueue.getJob(scheduleId);

    if (!job) {
      throw new NotFoundException(`Schedule ${scheduleId} not found`);
    }

    const updatedData = {
      ...job.data,
      metadata: {
        ...job.data.metadata,
        isPaused: false,
        pausedUntil: undefined,
      },
    };

    await job.update(updatedData);
    this.logger.log(`Resumed schedule ${scheduleId}`);

    return {
      success: true,
      scheduleId,
      isPaused: false,
      nextExecution: job.opts?.repeat && 'cron' in job.opts.repeat
        ? await this.getNextExecutionTime(job.opts.repeat.cron as string)
        : undefined,
    };
  }

  /**
   * List all scheduled jobs (for admin or debugging)
   */
  async listSchedules() {
    const jobs = await this.paymentsQueue.getRepeatableJobs();
    return jobs;
  }

  /**
   * Cancel a schedule completely
   */
  async cancelSchedule(scheduleId: string) {
    const repeatableJobs = await this.paymentsQueue.getRepeatableJobs();
    const job = repeatableJobs.find(j => j.id === scheduleId);

    if (!job) {
      throw new NotFoundException(`Schedule ${scheduleId} not found`);
    }

    await this.paymentsQueue.removeRepeatableByKey(job.key);
    this.logger.log(`Cancelled schedule ${scheduleId}`);

    return { success: true, message: 'Schedule cancelled', scheduleId };
  }

  /**
   * Generate CRON expression for schedule frequency
   */
  getCronExpression(
    frequency: ScheduleFrequency,
    customDay?: number,
    customCron?: string,
  ): string {
    if (frequency === 'custom' && customCron) {
      return customCron;
    }

    if (customDay) {
      return `0 0 ${customDay} * *`; // Custom day of month
    }

    switch (frequency) {
      case 'daily':
        return '0 0 * * *'; // Every day at midnight
      case 'weekly':
        return '0 0 * * 0'; // Every Sunday at midnight
      case 'biweekly':
        return '0 0 */14 * *'; // Every 14 days
      case 'monthly':
        return '0 0 1 * *'; // 1st of every month
      case 'monthly_5th':
        return '0 0 5 * *'; // 5th of every month
      case 'monthly_10th':
        return '0 0 10 * *'; // 10th of every month
      case 'monthly_15th':
        return '0 0 15 * *'; // 15th of every month
      case 'monthly_20th':
        return '0 0 20 * *'; // 20th of every month
      case 'monthly_25th':
        return '0 0 25 * *'; // 25th of every month
      case 'monthly_last':
        return '0 0 L * *'; // Last day of month (Bull/cron supports 'L')
      default:
        return '0 0 * * *'; // Default to daily
    }
  }

  /**
   * Format job data into ScheduleDetails
   */
  private async formatScheduleDetails(job: any): Promise<ScheduleDetails> {
    const data = job.data;
    const metadata: ScheduleMetadata = data.metadata || {
      scheduleId: job.id,
      retryCount: 0,
      maxRetries: 3,
      isPaused: false,
    };

    return {
      id: job.id,
      type: job.name === 'recurring-payment' ? 'payment' : 'bill',
      walletAddress: data.walletAddress,
      recipient: data.recipient,
      amount: data.amount,
      currency: data.currency || data.token,
      frequency: data.frequency,
      customCron: data.customCron,
      customDayOfMonth: data.customDayOfMonth,
      status: metadata.isPaused ? 'paused' : 'active',
      nextExecution: await this.getNextExecutionTime(job.opts?.repeat?.cron),
      lastExecution: metadata.lastAttempt,
      metadata,
      createdAt: new Date(job.timestamp),
      updatedAt: new Date(job.processedOn || job.timestamp),
    };
  }

  /**
   * Calculate next execution time from CRON expression
   */
  private async getNextExecutionTime(cron: string): Promise<Date | undefined> {
    try {
      // Simple estimation - in production, use cron-parser library
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      now.setDate(now.getDate() + 1); // Rough estimate: next day
      return now;
    } catch {
      return undefined;
    }
  }
}
