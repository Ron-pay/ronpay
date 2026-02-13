import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PaymentsService } from '../payments/payments.service';
import { MentoService } from '../blockchain/mento.service';
import { CeloService } from '../blockchain/celo.service';

@Processor('payments')
export class PaymentProcessor {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly mentoService: MentoService,
    private readonly celoService: CeloService,
  ) { }

  @Process('recurring-payment')
  async handleRecurringPayment(job: Job) {
    this.logger.log(`Processing recurring payment: ${job.id}`);
    const data = job.data;

    // 1. Check Sender Balance
    const sender = data.fromAddress; // Assuming job data has this
    if (sender) {
      const balances = await this.celoService.getAllBalances(sender);
      // Check if sufficient balance logic here...
      this.logger.log(`Sender ${sender} balance check: ${JSON.stringify(balances)}`);
    }

    // 2. Create "Action Required" Notification (Mock)
    this.logger.warn(`[ACTION REQUIRED] Recurring Payment due: ${data.amount} ${data.token} to ${data.recipient}`);
    this.logger.log(`User ${sender} should be notified to approve this transaction.`);
  }

  @Process('recurring-bill')
  async handleRecurringBill(job: Job) {
    this.logger.log(`Processing recurring bill: ${job.id}`);
    const data = job.data; // { serviceID: 'airtime', amount: 100, billersCode: '...', fromAddress: '...' }

    // 1. Calculate Cost in cUSD using Mento
    let costInCusd = '0.00';
    try {
      if (data.amount > 0) {
        const quote = await this.mentoService.getSwapQuote('NGNm', 'USDm', data.amount.toString());
        costInCusd = parseFloat(quote.amountOut).toFixed(2);
      }
    } catch (e) {
      this.logger.error('Failed to calculate bill cost', e);
    }

    // 2. Notify User 
    this.logger.warn(`[ACTION REQUIRED] Recurring Bill due: ${data.serviceID} (${data.amount} NGN ~= ${costInCusd} cUSD) for ${data.billersCode}`);
    this.logger.log(`User ${data.fromAddress} notified to top-up ${costInCusd} cUSD to Treasury.`);
  }
}
