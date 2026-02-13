import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentsService } from '../payments/payments.service';
import { MentoService } from '../blockchain/mento.service';
import { CeloService } from '../blockchain/celo.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ScheduleMetadata, DEFAULT_RETRY_CONFIG } from './interfaces/schedule.interface';
import { SupportedLanguage } from '../ai/language-detection';

@Processor('payments')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mentoService: MentoService,
    private readonly celoService: CeloService,
    private readonly notificationsService: NotificationsService,
  ) { }

  @Process('recurring-payment')
  async handleRecurringPayment(job: Job) {
    this.logger.log(`Processing recurring payment: ${job.id}`);
    const data = job.data;
    const metadata: ScheduleMetadata = data.metadata || this.getDefaultMetadata(job.id?.toString() || '');

    try {
      // 1. Check if schedule is paused
      if (metadata.isPaused) {
        // Check if pause period has expired
        if (metadata.pausedUntil && new Date() > new Date(metadata.pausedUntil)) {
          metadata.isPaused = false;
          metadata.pausedUntil = undefined;
          await job.update({ ...data, metadata });
          this.logger.log(`Schedule ${job.id} auto-resumed after pause period`);
        } else {
          this.logger.log(`Schedule ${job.id} is paused, skipping execution`);
          return { status: 'paused', scheduleId: job.id };
        }
      }

      // 2. Check sender balance
      const hasBalance = await this.checkBalance(data.walletAddress, data.amount, data.currency);

      if (!hasBalance) {
        this.logger.warn(`Insufficient balance for schedule ${job.id}`);
        await this.handleInsufficientBalance(job, data, metadata);
        return { status: 'insufficient_balance', retryCount: metadata.retryCount };
      }

      // 3. Execute payment (in real implementation, this would call blockchain)
      this.logger.log(`[MOCK] Executing payment: ${data.amount} ${data.currency} to ${data.recipient}`);

      // Mock execution - in production, integrate with actual payment flow
      const txHash = `0x${Math.random().toString(16).slice(2)}`;

      // 4. Send success notification
      await this.sendSuccessNotification(data, txHash, metadata);

      // 5. Reset retry count on success
      metadata.retryCount = 0;
      metadata.lastAttempt = new Date();
      await job.update({ ...data, metadata });

      this.logger.log(`Successfully executed recurring payment ${job.id}`);

      return {
        status: 'success',
        txHash,
        scheduleId: job.id,
      };

    } catch (error) {
      this.logger.error(`Failed to execute recurring payment ${job.id}: ${error.message}`, error.stack);
      await this.handleFailure(job, data, metadata, error.message);
      return {
        status: 'failed',
        error: error.message,
        retryCount: metadata.retryCount,
      };
    }
  }

  @Process('recurring-bill')
  async handleRecurringBill(job: Job) {
    this.logger.log(`Processing recurring bill: ${job.id}`);
    const data = job.data;
    const metadata: ScheduleMetadata = data.metadata || this.getDefaultMetadata(job.id?.toString() || '');

    try {
      // 1. Check if paused
      if (metadata.isPaused) {
        if (metadata.pausedUntil && new Date() > new Date(metadata.pausedUntil)) {
          metadata.isPaused = false;
          await job.update({ ...data, metadata });
        } else {
          this.logger.log(`Bill schedule ${job.id} is paused`);
          return { status: 'paused' };
        }
      }

      // 2. Calculate cost in stable tokens
      let costInToken = data.amount;
      try {
        if (data.amount > 0) {
          const quote = await this.mentoService.getSwapQuote('NGNm', 'USDm', data.amount.toString());
          costInToken = parseFloat(quote.amountOut);
        }
      } catch (e) {
        this.logger.error('Failed to calculate bill cost', e);
      }

      // 3. Check balance
      const hasBalance = await this.checkBalance(data.walletAddress, costInToken, 'USDm');

      if (!hasBalance) {
        this.logger.warn(`Insufficient balance for bill ${job.id}`);
        await this.handleInsufficientBalance(job, data, metadata);
        return { status: 'insufficient_balance' };
      }

      // 4. Execute bill payment
      this.logger.log(`[MOCK] Executing bill payment: ${data.serviceID} for ${data.billersCode}`);

      // 5. Send notification
      const language: SupportedLanguage = metadata.language as SupportedLanguage || 'en';
      const phone = '+1234567890'; // TODO: Get from user profile

      await this.notificationsService.sendNotification({
        toPhone: phone,
        message: `✅ Bill payment completed: ${data.serviceID} - ${data.amount} NGN`,
        channel: 'sms',
      });

      metadata.retryCount = 0;
      metadata.lastAttempt = new Date();
      await job.update({ ...data, metadata });

      return { status: 'success', scheduleId: job.id };

    } catch (error) {
      this.logger.error(`Failed to execute recurring bill ${job.id}: ${error.message}`);
      await this.handleFailure(job, data, metadata, error.message);
      return { status: 'failed', error: error.message };
    }
  }

  /**
   * Check if wallet has sufficient balance
   */
  private async checkBalance(walletAddress: string, amount: number, currency: string): Promise<boolean> {
    try {
      const balances = await this.celoService.getAllBalances(walletAddress as `0x${string}`);
      const balance = parseFloat(balances[currency] || '0');

      this.logger.log(`Balance check: ${walletAddress} has ${balance} ${currency}, needs ${amount}`);

      return balance >= amount;
    } catch (error) {
      this.logger.error(`Balance check failed: ${error.message}`);
      return false; // Assume insufficient on error (conservative)
    }
  }

  /**
   * Handle insufficient balance with retry logic
   */
  private async handleInsufficientBalance(job: Job, data: any, metadata: ScheduleMetadata) {
    metadata.retryCount = (metadata.retryCount || 0) + 1;
    metadata.lastAttempt = new Date();
    metadata.failureReason = 'insufficient_balance';

    if (metadata.retryCount <= metadata.maxRetries) {
      // Schedule retry with backoff
      const delay = this.getRetryDelay(metadata.retryCount);
      metadata.nextAttempt = new Date(Date.now() + delay);

      this.logger.log(`Scheduling retry ${metadata.retryCount}/${metadata.maxRetries} for ${job.id} in ${delay}ms`);

      // Update job metadata
      await job.update({ ...data, metadata });

      // Send retry notification
      const language: SupportedLanguage = metadata.language as SupportedLanguage || 'en';
      const phone = '+1234567890'; // TODO: Get from user profile

      await this.notificationsService.sendPaymentFailed(
        phone,
        data.amount,
        data.currency || data.token,
        language,
      );

    } else {
      // Max retries exceeded
      this.logger.warn(`Max retries exceeded for ${job.id}, marking as failed`);

      metadata.isPaused = true;
      metadata.failureReason = 'max_retries_exceeded';
      await job.update({ ...data, metadata });

      // Send final failure notification
      const language: SupportedLanguage = metadata.language as SupportedLanguage || 'en';
      const phone = '+1234567890'; // TODO: Get from user profile

      const messages = {
        en: `❌ Recurring payment failed after ${metadata.maxRetries} attempts. Please check your balance and resume schedule.`,
        es: `❌ El pago recurrente falló después de ${metadata.maxRetries} intentos. Verifica tu saldo y reanuda el programa.`,
        pt: `❌ O pagamento recorrente falhou após ${metadata.maxRetries} tentativas. Verifique seu saldo e retome o cronograma.`,
        fr: `❌ Le paiement récurrent a échoué après ${metadata.maxRetries} tentatives. Vérifiez votre solde et reprenez le calendrier.`,
      };

      await this.notificationsService.sendNotification({
        toPhone: phone,
        message: messages[language] || messages.en,
        channel: 'sms',
      });
    }
  }

  /**
   * Handle general payment failure
   */
  private async handleFailure(job: Job, data: any, metadata: ScheduleMetadata, reason: string) {
    metadata.retryCount = (metadata.retryCount || 0) + 1;
    metadata.lastAttempt = new Date();
    metadata.failureReason = reason;

    if (metadata.retryCount <= metadata.maxRetries) {
      const delay = this.getRetryDelay(metadata.retryCount);
      metadata.nextAttempt = new Date(Date.now() + delay);

      await job.update({ ...data, metadata });
      this.logger.log(`Scheduled retry for ${job.id} after failure: ${reason}`);
    } else {
      metadata.isPaused = true;
      await job.update({ ...data, metadata });
      this.logger.error(`Schedule ${job.id} paused after max retries: ${reason}`);
    }
  }

  /**
   * Send success notification with savings info
   */
  private async sendSuccessNotification(data: any, txHash: string, metadata: ScheduleMetadata) {
    try {
      const phone = '+1234567890'; // TODO: Get from user profile

      await this.notificationsService.sendPaymentConfirmation({
        toPhone: phone,
        amount: data.amount,
        currency: data.currency || data.token,
        txHash,
        language: metadata.language as SupportedLanguage,
        savings: 2.5, // TODO: Calculate actual savings from fees service
      });
    } catch (error) {
      this.logger.error(`Failed to send success notification: ${error.message}`);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private getRetryDelay(retryCount: number): number {
    const delays = DEFAULT_RETRY_CONFIG.delays;
    const index = Math.min(retryCount - 1, delays.length - 1);
    return delays[index];
  }

  /**
   * Get default metadata for job
   */
  private getDefaultMetadata(scheduleId: string): ScheduleMetadata {
    return {
      scheduleId,
      retryCount: 0,
      maxRetries: DEFAULT_RETRY_CONFIG.maxRetries,
      isPaused: false,
    };
  }
}
