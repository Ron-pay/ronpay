import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { CeloService } from '../blockchain/celo.service';
import { ClaudeService } from '../ai/claude.service';
import { TransactionsService } from '../transactions/transactions.service';
import { NaturalLanguagePaymentDto, ExecutePaymentDto } from './dto/natural-language-payment.dto';
import { Address } from 'viem';

@Injectable()
export class PaymentsService {
  constructor(
    private celoService: CeloService,
    private claudeService: ClaudeService,
    private transactionsService: TransactionsService,
  ) {}

  /**
   * Parse natural language and return transaction data for client-side signing
   * MiniPay-compatible: Returns unsigned transaction
   */
  async parsePaymentIntent(dto: NaturalLanguagePaymentDto) {
    // 1. Parse intent with Claude AI
    const intent = await this.claudeService.parsePaymentIntent(dto.message);

    console.log('Parsed intent:', intent);

    // 2. Validate intent & specific flows
    if (intent.confidence && intent.confidence < 0.5) {
      throw new BadRequestException(
        'Unable to understand payment request with sufficient confidence. Please be more specific.',
      );
    }

    // VTPASS Flows (Airtime, Data, Bills)
    if (['buy_airtime', 'buy_data', 'pay_bill'].includes(intent.action)) {
      return this.handleVtpassIntent(intent);
    }

    // Standard Crypto Transfer Flow
    if (intent.action === 'send_payment') {
      if (!intent.recipient) {
        throw new BadRequestException('Could not determine payment recipient from message');
      }
      if (!intent.amount || intent.amount <= 0) {
        throw new BadRequestException('Could not determine valid payment amount from message');
      }

      if (!this.celoService.isValidAddress(intent.recipient)) {
        throw new BadRequestException(`Invalid recipient address: ${intent.recipient}`);
      }

      const currency = intent.currency || 'cUSD';
      const transactionData = await this.celoService.buildPaymentTransaction(
        intent.recipient as Address,
        intent.amount.toString(),
        currency as any, // cUSD, cKES, etc.
      );

      return {
        intent,
        transaction: transactionData,
        parsedCommand: {
          recipient: intent.recipient,
          amount: intent.amount,
          currency,
          memo: intent.memo,
        },
      };
    }

    throw new BadRequestException(`Action "${intent.action}" not supported yet.`);
  }

  /**
   * Handle VTPASS intents (Airtime, Bills)
   * Flow: User pays cUSD to Treasury -> Backend detects tx -> Backend triggers VTPASS
   */
  private async handleVtpassIntent(intent: any) {
    // 1. Determine amount in cUSD (Mock rate 1 cUSD = 1500 NGN for MVP)
    // In production, fetch real rates.
    const MOCK_RATE_NGN_CUSD = 1500;
    const amountInNgn = intent.amount || 100; // Default 100 NGN
    const amountInCusd = (amountInNgn / MOCK_RATE_NGN_CUSD).toFixed(2);

    // 2. Get Treasury Address
    const treasuryAddress = process.env.RONPAY_TREASURY_ADDRESS;
    if (!treasuryAddress) {
      throw new InternalServerErrorException('Treasury address not configured');
    }

    // 3. Build Transaction: User -> Treasury
    const transactionData = await this.celoService.buildPaymentTransaction(
      treasuryAddress as Address,
      amountInCusd,
      'cUSD',
    );

    return {
      intent,
      transaction: transactionData,
      meta: {
        serviceType: intent.action, // buy_airtime, pay_bill
        provider: intent.provider,
        recipient: intent.recipient, // phone or meter number
        originalAmountNgn: amountInNgn,
        exchangeRate: MOCK_RATE_NGN_CUSD,
      },
      parsedCommand: {
        recipient: 'RonPay Treasury', // Displayed to user
        amount: parseFloat(amountInCusd),
        currency: 'cUSD',
        memo: `Payment for ${intent.provider} ${intent.action}`,
      },
    };
  }

  /**
   * Record a transaction that was executed client-side (by MiniPay)
   * For VTPASS: If we see a successful payment to Treasury with VTPASS metadata, trigger the service.
   */
  async recordTransaction(dto: ExecutePaymentDto) {
    // Validate transaction hash format
    if (!/^0x[a-fA-F0-9]{64}$/.test(dto.txHash)) {
      throw new BadRequestException('Invalid transaction hash format');
    }

    // Save transaction to database
    const transaction = await this.transactionsService.create({
      fromAddress: dto.fromAddress.toLowerCase(),
      toAddress: dto.toAddress.toLowerCase(),
      amount: dto.amount,
      currency: dto.currency,
      txHash: dto.txHash,
      status: 'pending',
      intent: dto.intent || '',
      memo: dto.memo || '',
      type: dto.intent?.includes('buy') || dto.intent?.includes('pay') ? 'bill_payment' : 'transfer', // Simple heuristic
    });

    // Monitor transaction confirmation in background
    this.celoService.waitForTransaction(dto.txHash as `0x${string}`)
      .then(async (receipt) => {
        if (receipt.status === 'success') {
          await this.transactionsService.updateStatus(dto.txHash, 'success');

          // TODO: Here is where we would trigger actual VTPASS purchase if it was a bill payment
          // Check if transaction.toAddress === TREASURY_ADDRESS
          // And if we have metadata about the bill (this would require passing metadata in ExecutePaymentDto)
        } else {
          await this.transactionsService.updateStatus(dto.txHash, 'failed');
        }
      })
      .catch((error) => {
        console.error('Transaction confirmation error:', error);
        this.transactionsService.updateStatus(dto.txHash, 'failed');
      });

    return {
      success: true,
      transaction,
      message: 'Transaction recorded and being monitored',
    };
  }

  /**
   * Get balance for a wallet address
   */
  async getBalance(address: string) {
    if (!this.celoService.isValidAddress(address)) {
      throw new BadRequestException(`Invalid address: ${address}`);
    }

    const balances = await this.celoService.getAllBalances(address as Address);

    return {
      address,
      balances,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens() {
    return {
      tokens: this.celoService.getSupportedTokens(),
      mainnet: {
        cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
        cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
        cREAL: '0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787',
        cKES: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
      },
    };
  }
}
