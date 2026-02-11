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

    // 2. Validate intent
    if (intent.action !== 'send_payment') {
      throw new BadRequestException(
        `Action "${intent.action}" not supported. Only send_payment is available in MVP.`,
      );
    }

    if (!intent.recipient) {
      throw new BadRequestException('Could not determine payment recipient from message');
    }

    if (!intent.amount || intent.amount <= 0) {
      throw new BadRequestException('Could not determine valid payment amount from message');
    }

    if (intent.confidence && intent.confidence < 0.5) {
      throw new BadRequestException(
        'Unable to understand payment request with sufficient confidence. Please be more specific.',
      );
    }

    // 3. Validate recipient address
    if (!this.celoService.isValidAddress(intent.recipient)) {
      throw new BadRequestException(`Invalid recipient address: ${intent.recipient}`);
    }

    // 4. Build unsigned transaction for MiniPay to sign
    const currency = intent.currency || 'cUSD';
    const transactionData = await this.celoService.buildPaymentTransaction(
      intent.recipient as Address,
      intent.amount.toString(),
      currency as any,
    );

    // 5. Return transaction data + intent for frontend
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

  /**
   * Record a transaction that was executed client-side (by MiniPay)
   * Called after user signs and broadcasts the transaction
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
    });

    // Monitor transaction confirmation in background
    this.celoService.waitForTransaction(dto.txHash as `0x${string}`)
      .then((receipt) => {
        const status = receipt.status === 'success' ? 'success' : 'failed';
        this.transactionsService.updateStatus(dto.txHash, status);
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
