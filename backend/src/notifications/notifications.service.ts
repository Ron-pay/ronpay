import { Injectable, Logger } from '@nestjs/common';
import { TwilioProvider } from './providers/twilio.provider';
import { PaymentConfirmationDto, RecurringReminderDto, SendNotificationDto } from './dto/notification.dto';
import {
  PAYMENT_SENT_TEMPLATES,
  PAYMENT_RECEIVED_TEMPLATES,
  RECURRING_REMINDER_TEMPLATES,
  FAILED_PAYMENT_TEMPLATES,
  getTxExplorerUrl,
} from './templates/message-templates';
import { SupportedLanguage } from '../ai/language-detection';

/**
 * Notifications Service
 * Manages SMS and WhatsApp notifications for RonPay events
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly twilioProvider: TwilioProvider) {}

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(dto: PaymentConfirmationDto): Promise<void> {
    const language: SupportedLanguage = dto.language || 'en';
    
    const message = PAYMENT_SENT_TEMPLATES[language]({
      amount: dto.amount,
      currency: dto.currency,
      txHash: dto.txHash,
      explorerUrl: getTxExplorerUrl(dto.txHash),
      savings: dto.savings,
    });

    try {
      // Try WhatsApp first (lower cost), fallback to SMS
      try {
        await this.twilioProvider.sendWhatsApp(dto.toPhone, message);
        this.logger.log(`Payment confirmation sent via WhatsApp to ${dto.toPhone}`);
      } catch (whatsappError) {
        this.logger.warn(`WhatsApp failed, falling back to SMS: ${whatsappError.message}`);
        await this.twilioProvider.sendSms(dto.toPhone, message);
        this.logger.log(`Payment confirmation sent via SMS to ${dto.toPhone}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation: ${error.message}`, error.stack);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Send payment received notification
   */
  async sendPaymentReceived(
    toPhone: string,
    amount: number,
    currency: string,
    txHash: string,
    language: SupportedLanguage = 'en',
  ): Promise<void> {
    const message = PAYMENT_RECEIVED_TEMPLATES[language]({
      amount,
      currency,
      txHash,
    });

    try {
      await this.twilioProvider.sendSms(toPhone, message);
      this.logger.log(`Payment received notification sent to ${toPhone}`);
    } catch (error) {
      this.logger.error(`Failed to send payment received notification: ${error.message}`);
    }
  }

  /**
   * Send recurring payment reminder
   */
  async sendRecurringReminder(dto: RecurringReminderDto): Promise<void> {
    const language: SupportedLanguage = dto.language || 'en';

    const message = RECURRING_REMINDER_TEMPLATES[language]({
      amount: dto.amount,
      currency: dto.currency,
      recipient: dto.recipientName,
      date: dto.nextExecutionDate,
    });

    try {
      await this.twilioProvider.sendSms(dto.toPhone, message);
      this.logger.log(`Recurring reminder sent to ${dto.toPhone}`);
    } catch (error) {
      this.logger.error(`Failed to send recurring reminder: ${error.message}`);
    }
  }

  /**
   * Send failed payment notification
   */
  async sendPaymentFailed(
    toPhone: string,
    amount: number,
    currency: string,
    language: SupportedLanguage = 'en',
  ): Promise<void> {
    const message = FAILED_PAYMENT_TEMPLATES[language]({
      amount,
      currency,
    });

    try {
      await this.twilioProvider.sendSms(toPhone, message);
      this.logger.log(`Payment failed notification sent to ${toPhone}`);
    } catch (error) {
      this.logger.error(`Failed to send payment failed notification: ${error.message}`);
    }
  }

  /**
   * Send generic notification
   */
  async sendNotification(dto: SendNotificationDto): Promise<void> {
    const channel = dto.channel || 'sms';

    try {
      if (channel === 'whatsapp') {
        await this.twilioProvider.sendWhatsApp(dto.toPhone, dto.message);
      } else {
        await this.twilioProvider.sendSms(dto.toPhone, dto.message);
      }

      this.logger.log(`Notification sent via ${channel} to ${dto.toPhone}`);
    } catch (error) {
      this.logger.error(`Failed to send ${channel} notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return this.twilioProvider.isEnabled();
  }
}
