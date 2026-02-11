import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentsService } from '../payments/payments.service';

@Processor('payments')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(private readonly paymentsService: PaymentsService) {}

  @Process('recurring-payment')
  async handleRecurringPayment(job: Job) {
    this.logger.log(`Processing recurring payment: ${job.id}`);
    const data = job.data;

    // Logic to execute payment
    // IMPORTANT: In a real non-custodial app, we can't sign for the user unless we have delegated key or session key.
    // For this Hackathon & "Agentic" theme, we assume:
    // 1. Backend has a relayer key (custodial for automated tasks) OR
    // 2. We just notify the user (but user wanted "agentic automation")
    
    // Implementing notification/logging for now, as we removed the private key from CeloService.
    // To make this fully functional, we'd need Session Keys (ERC-4337) or a custodial "spending wallet".
    
    this.logger.log(`[MOCK EXECUTION] Sending ${data.amount} ${data.token} to ${data.recipient}`);
    // In a production version, this would use a session key to execute the transaction.
  }

  @Process('recurring-bill')
  async handleRecurringBill(job: Job) {
    this.logger.log(`Processing recurring bill: ${job.id}`);
    const data = job.data;

    this.logger.log(`[MOCK EXECUTION] Paying bill ${data.serviceID} - ${data.billersCode}`);
  }
}
