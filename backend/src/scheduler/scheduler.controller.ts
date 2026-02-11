import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Post('payment')
  async schedulePayment(@Body() body: any) {
    return this.schedulerService.schedulePayment(body);
  }

  @Post('bill')
  async scheduleBill(@Body() body: any) {
    return this.schedulerService.scheduleBill(body);
  }

  @Get()
  async listSchedules() {
    return this.schedulerService.listSchedules();
  }

  @Delete(':key')
  async cancelSchedule(@Param('key') key: string) {
    return this.schedulerService.cancelSchedule(key);
  }
}
