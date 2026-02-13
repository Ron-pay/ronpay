import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

/**
 * Twilio Provider for SMS and WhatsApp notifications
 * @see https://www.twilio.com/docs/sms/quickstart/node
 */
@Injectable()
export class TwilioProvider {
  private readonly logger = new Logger(TwilioProvider.name);
  private readonly client: twilio.Twilio | null;
  private readonly fromNumber: string;
  private readonly whatsappNumber: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get('TWILIO_PHONE_NUMBER', '');
    this.whatsappNumber = this.configService.get('TWILIO_WHATSAPP_NUMBER', '');

    if (!accountSid || !authToken) {
      this.logger.warn('Twilio credentials not configured - notifications disabled');
      this.enabled = false;
      this.client = null;
    } else {
      this.enabled = true;
      this.client = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized for SMS/WhatsApp');
    }
  }

  /**
   * Send SMS message
   * @param to Recipient phone number in E.164 format (+2348012345678)
   * @param message Message content
   */
  async sendSms(to: string, message: string): Promise<{ sid: string; status: string }> {
    if (!this.enabled || !this.client) {
      this.logger.warn(`SMS disabled - would send to ${to}: ${message}`);
      return { sid: 'mock-sid', status: 'mock-sent' };
    }

    try {
      this.logger.log(`Sending SMS to ${to}`);

      const result = await this.client.messages.create({
        to,
        from: this.fromNumber,
        body: message,
      });

      this.logger.log(`SMS sent successfully: ${result.sid}`);

      return {
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send WhatsApp message
   * @param to Recipient phone number in E.164 format (+2348012345678)
   * @param message Message content
   */
  async sendWhatsApp(to: string, message: string): Promise<{ sid: string; status: string }> {
    if (!this.enabled || !this.client) {
      this.logger.warn(`WhatsApp disabled - would send to ${to}: ${message}`);
      return { sid: 'mock-sid', status: 'mock-sent' };
    }

    try {
      this.logger.log(`Sending WhatsApp to ${to}`);

      const result = await this.client.messages.create({
        to: `whatsapp:${to}`,
        from: this.whatsappNumber,
        body: message,
      });

      this.logger.log(`WhatsApp sent successfully: ${result.sid}`);

      return {
        sid: result.sid,
        status: result.status,
      };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if Twilio is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}
