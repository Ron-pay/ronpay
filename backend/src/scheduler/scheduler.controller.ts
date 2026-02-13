import { Controller, Post, Get, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CreateScheduleDto, CreateBillScheduleDto, UpdateScheduleDto, PauseScheduleDto } from './dto/schedule.dto';

/**
 * Scheduler Controller
 * Manages recurring payment and bill payment schedules
 */
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  /**
   * Schedule a recurring payment
   * POST /scheduler/payment
   */
  @Post('payment')
  @HttpCode(HttpStatus.CREATED)
  async schedulePayment(@Body() dto: CreateScheduleDto) {
    return this.schedulerService.schedulePayment(dto);
  }

  /**
   * Schedule a recurring bill payment
   * POST /scheduler/bill
   */
  @Post('bill')
  @HttpCode(HttpStatus.CREATED)
  async scheduleBill(@Body() dto: CreateBillScheduleDto) {
    return this.schedulerService.scheduleBill(dto);
  }

  /**
   * Get all schedules (admin/debug endpoint)
   * GET /scheduler
   */
  @Get()
  async getAllSchedules() {
    const schedules = await this.schedulerService.listSchedules();
    return {
      schedules,
      count: schedules.length,
    };
  }

  /**
   * Get schedules for a specific wallet
   * GET /scheduler/schedules/:walletAddress
   */
  @Get('schedules/:walletAddress')
  async getWalletSchedules(@Param('walletAddress') walletAddress: string) {
    const schedules = await this.schedulerService.getSchedulesByWallet(walletAddress);
    return {
      walletAddress,
      schedules,
      count: schedules.length,
    };
  }

  /**
   * Get specific schedule by ID
   * GET /scheduler/schedule/:scheduleId
   */
  @Get('schedule/:scheduleId')
  async getSchedule(@Param('scheduleId') scheduleId: string) {
    return this.schedulerService.getScheduleById(scheduleId);
  }

  /**
   * Update a schedule
   * PATCH /scheduler/schedule/:scheduleId
   */
  @Patch('schedule/:scheduleId')
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulerService.updateSchedule(scheduleId, dto);
  }

  /**
   * Pause a schedule
   * POST /scheduler/schedule/:scheduleId/pause
   */
  @Post('schedule/:scheduleId/pause')
  async pauseSchedule(
    @Param('scheduleId') scheduleId: string,
    @Body() dto?: PauseScheduleDto,
  ) {
    return this.schedulerService.pauseSchedule(scheduleId, dto);
  }

  /**
   * Resume a paused schedule
   * POST /scheduler/schedule/:scheduleId/resume
   */
  @Post('schedule/:scheduleId/resume')
  async resumeSchedule(@Param('scheduleId') scheduleId: string) {
    return this.schedulerService.resumeSchedule(scheduleId);
  }

  /**
   * Cancel a schedule
   * DELETE /scheduler/schedule/:scheduleId
   */
  @Delete('schedule/:scheduleId')
  async cancelSchedule(@Param('scheduleId') scheduleId: string) {
    return this.schedulerService.cancelSchedule(scheduleId);
  }

  /**
   * Legacy endpoint - kept for backward compatibility
   * DELETE /scheduler/:key
   */
  @Delete(':key')
  async cancelScheduleLegacy(@Param('key') key: string) {
    return this.schedulerService.cancelSchedule(key);
  }
}
