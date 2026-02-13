import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TwilioProvider } from './providers/twilio.provider';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, TwilioProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
