import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(@InjectQueue('payments') private paymentsQueue: Queue) {}

  /**
   * Schedule a recurring payment
   */
  async schedulePayment(data: {
    recipient: string;
    amount: number;
    token: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    walletAddress: string;
  }) {
    const cron = this.getCronExpression(data.frequency);
    
    const job = await this.paymentsQueue.add(
      'recurring-payment',
      data,
      {
        repeat: {
          cron,
        },
        jobId: `pay-${data.walletAddress}-${Date.now()}`, // Unique ID
      },
    );

    this.logger.log(`Scheduled payment job ${job.id} for ${data.walletAddress} (${data.frequency})`);
    return job;
  }

  /**
   * Schedule a bill payment (e.g., VTPASS)
   */
  async scheduleBill(data: {
    serviceID: string;
    billersCode: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly';
    walletAddress: string;
  }) {
    const cron = this.getCronExpression(data.frequency);

    const job = await this.paymentsQueue.add(
      'recurring-bill',
      data,
      {
        repeat: { cron },
        jobId: `bill-${data.walletAddress}-${Date.now()}`,
      },
    );

    this.logger.log(`Scheduled bill job ${job.id} for ${data.walletAddress} (${data.frequency})`);
    return job;
  }

  /**
   * List scheduled jobs
   */
  async listSchedules() {
    const jobs = await this.paymentsQueue.getRepeatableJobs();
    return jobs;
  }

  /**
   * Cancel a schedule
   */
  async cancelSchedule(key: string) {
    await this.paymentsQueue.removeRepeatableByKey(key);
    return { success: true, message: 'Schedule cancelled' };
  }

  private getCronExpression(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return '0 0 * * *'; // Every day at midnight
      case 'weekly':
        return '0 0 * * 0'; // Every Sunday at midnight
      case 'monthly':
        return '0 0 1 * *'; // 1st of every month
      default:
        return '0 0 * * *';
    }
  }
}
