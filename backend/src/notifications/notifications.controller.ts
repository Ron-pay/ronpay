import { Controller, Post, Body, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto, PaymentConfirmationDto } from './dto/notification.dto';

/**
 * Notifications Controller
 * Manages notification endpoints (primarily for testing)
 */
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Send a test notification
   * POST /notifications/send
   */
  @Post('send')
  async sendNotification(@Body() dto: SendNotificationDto) {
    await this.notificationsService.sendNotification(dto);

    return {
      status: 'sent',
      to: dto.toPhone,
      channel: dto.channel || 'sms',
    };
  }

  /**
   * Send payment confirmation (for testing)
   * POST /notifications/payment-confirmation
   */
  @Post('payment-confirmation')
  async sendPaymentConfirmation(@Body() dto: PaymentConfirmationDto) {
    await this.notificationsService.sendPaymentConfirmation(dto);

    return {
      status: 'sent',
      to: dto.toPhone,
    };
  }

  /**
   * Check notification service status
   * GET /notifications/status
   */
  @Get('status')
  getStatus() {
    return {
      enabled: this.notificationsService.isEnabled(),
      provider: 'Twilio',
      channels: ['sms', 'whatsapp'],
    };
  }
}
