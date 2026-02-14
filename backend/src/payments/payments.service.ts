import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CeloService } from '../blockchain/celo.service';
import { MentoService } from '../blockchain/mento.service';
import { IdentityService } from '../blockchain/identity.service';
import { AiService } from '../ai/ai.service';
import { ClaudeService } from '../ai/claude.service';
import { GeminiService } from '../ai/gemini.service';
import { TransactionsService } from '../transactions/transactions.service';
import { VtpassService } from '../vtpass/vtpass.service';
import {
  NaturalLanguagePaymentDto,
  ExecutePaymentDto,
} from './dto/natural-language-payment.dto';
import { Address } from 'viem';
import { PaymentIntent } from '../types';
import { PurchaseAirtimeDto } from '../vtpass/dto/vtpass-airtime.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private celoService: CeloService,
    private aiService: AiService,
    private transactionsService: TransactionsService,
    private mentoService: MentoService,
    private identityService: IdentityService,
    private vtpassService: VtpassService,
    private claudeService: ClaudeService,
    private geminiService: GeminiService,
  ) {}

  /**
   * Parse natural language and return transaction data for client-side signing
   * MiniPay-compatible: Returns unsigned transaction
   */
  async parsePaymentIntent(dto: NaturalLanguagePaymentDto) {
    // 1. Select AI Service
    let aiService = this.aiService; // Default injected service

    if (dto.aiProvider === 'claude') {
      aiService = this.claudeService;
    } else if (dto.aiProvider === 'gemini') {
      aiService = this.geminiService;
    }

    // 2. Parse intent with selected AI
    const intent = await aiService.parsePaymentIntent(
      dto.message,
      dto.language,
    );

    console.log(
      '[PaymentsService] Parsed intent:',
      JSON.stringify(intent, null, 2),
    );

    // 2. Validate intent & specific flows
    if (!intent || (intent.confidence && intent.confidence < 0.5)) {
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
        throw new BadRequestException(
          'Could not determine payment recipient from message',
        );
      }
      if (!intent.amount || intent.amount <= 0) {
        throw new BadRequestException(
          'Could not determine valid payment amount from message',
        );
      }

      // 1. Resolve Recipient (Phone -> Address)
      let recipientAddress = intent.recipient;
      if (
        recipientAddress &&
        !this.celoService.isValidAddress(recipientAddress)
      ) {
        // Assume it's a phone number or alias
        const resolved =
          await this.identityService.resolvePhoneNumber(recipientAddress);
        if (resolved) {
          console.log(`Resolved ${recipientAddress} to ${resolved}`);
          recipientAddress = resolved;
        } else {
          throw new BadRequestException(
            `Unable to resolve recipient: ${recipientAddress}. Please use a valid Celo address or registered phone number.`,
          );
        }
      }

      if (!recipientAddress) {
        throw new BadRequestException('Could not determine payment recipient');
      }

      if (!this.celoService.isValidAddress(recipientAddress)) {
        throw new BadRequestException(
          `Invalid recipient address: ${recipientAddress}`,
        );
      }

      const currency = intent.currency || 'cUSD';

      // Check if authorized token (Simple validation)
      // const supportedTokens = this.celoService.getSupportedTokens();

      const transactionData = await this.celoService.buildPaymentTransaction(
        recipientAddress as Address,
        intent.amount.toString(),
        currency as any,
      );

      return {
        intent,
        transaction: transactionData,
        parsedCommand: {
          recipient: recipientAddress,
          originalRecipient: intent.recipient,
          amount: intent.amount,
          currency,
          memo: intent.memo,
        },
      };
    }

    throw new BadRequestException(
      `Action "${intent.action}" not supported yet.`,
    );
  }

  /**
   * Parse payment intent directly (bypasses AI - for development/testing)
   * Useful for saving Claude tokens during development
   */
  async parsePaymentIntentDirect(intent: PaymentIntent, senderAddress: string) {
    console.log(
      '[PaymentsService] Direct intent parsing (bypassing AI):',
      JSON.stringify(intent, null, 2),
    );

    // Validate intent
    if (!intent || (intent.confidence && intent.confidence < 0.5)) {
      throw new BadRequestException(
        'Invalid payment intent. Please provide all required fields.',
      );
    }

    // VTPASS Flows (Airtime, Data, Bills)
    if (['buy_airtime', 'buy_data', 'pay_bill'].includes(intent.action)) {
      return this.handleVtpassIntent(intent);
    }

    // Standard Crypto Transfer Flow
    if (intent.action === 'send_payment') {
      if (!intent.recipient) {
        throw new BadRequestException('recipient field is required');
      }
      if (!intent.amount || intent.amount <= 0) {
        throw new BadRequestException('amount must be a valid positive number');
      }

      // 1. Resolve Recipient (Phone -> Address)
      let recipientAddress = intent.recipient;
      if (
        recipientAddress &&
        !this.celoService.isValidAddress(recipientAddress)
      ) {
        // Assume it's a phone number or alias
        const resolved =
          await this.identityService.resolvePhoneNumber(recipientAddress);
        if (resolved) {
          console.log(`Resolved ${recipientAddress} to ${resolved}`);
          recipientAddress = resolved;
        } else {
          throw new BadRequestException(
            `Unable to resolve recipient: ${recipientAddress}. Please use a valid Celo address or registered phone number.`,
          );
        }
      }

      if (!recipientAddress) {
        throw new BadRequestException('Could not determine payment recipient');
      }

      if (!this.celoService.isValidAddress(recipientAddress)) {
        throw new BadRequestException(
          `Invalid recipient address: ${recipientAddress}`,
        );
      }

      const currency = intent.currency || 'USDm';

      const transactionData = await this.celoService.buildPaymentTransaction(
        recipientAddress as Address,
        intent.amount.toString(),
        currency as any,
      );

      return {
        intent,
        transaction: transactionData,
        parsedCommand: {
          recipient: recipientAddress,
          originalRecipient: intent.recipient,
          amount: intent.amount,
          currency,
          memo: intent.memo,
        },
      };
    }

    throw new BadRequestException(
      `Action "${intent.action}" not supported yet.`,
    );
  }

  /**
   * Handle VTPASS intents (Airtime, Bills)
   * Flow: User pays cUSD to Treasury -> Backend detects tx -> Backend triggers VTPASS
   */
  private async handleVtpassIntent(intent: any) {
    // 1. Determine amount in cUSD using Mento Service
    // We want to know: "How much cUSD is 100 NGN?" -> Swap cNGN -> cUSD
    const amountInNgn = intent.amount || 100; // Default 100 NGN

    let exchangeRate = 1500; // Fallback
    let amountInCusd = '0.07';

    try {
      // Get quote: 1 cUSD -> NGN (to get the rate) OR amountInNgn cNGN -> cUSD?
      // Let's ask: "What is value of X cNGN in cUSD?"
      const quote = await this.mentoService.getSwapQuote(
        'NGNm',
        'USDm',
        amountInNgn.toString(),
      );

      console.log('Mento quote:', JSON.stringify(quote, null, 2));
      amountInCusd = parseFloat(quote.amountOut).toFixed(2);
      exchangeRate = 1 / quote.price; // Derived rate
    } catch (error) {
      console.error(
        'Failed to get Mento rate for VTPASS, using fallback',
        error,
      );
      // Fallback calculation
      amountInCusd = (amountInNgn / 1500).toFixed(2);
    }

    // 2. Get Treasury Address
    const treasuryAddress = process.env.RONPAY_TREASURY_ADDRESS;
    if (!treasuryAddress) {
      throw new InternalServerErrorException('Treasury address not configured');
    }

    // 3. Build Transaction: User -> Treasury
    const transactionData = await this.celoService.buildPaymentTransaction(
      treasuryAddress as Address,
      amountInCusd,
      'USDm',
    );

    return {
      intent,
      transaction: transactionData,
      meta: {
        serviceType: intent.action, // buy_airtime, pay_bill
        provider: intent.biller || intent.provider || 'VTPASS',
        recipient: intent.recipient, // phone or meter number
        originalAmountNgn: amountInNgn,
        exchangeRate: exchangeRate,
        variation_code: intent.package,
      },
      parsedCommand: {
        recipient: 'RonPay Treasury',
        amount: parseFloat(amountInCusd),
        currency: 'cUSD',
        memo: `Payment for ${intent.biller || 'Service'} ${intent.package || ''}`,
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
      type:
        dto.type ||
        (dto.intent?.includes('buy') || dto.intent?.includes('pay')
          ? 'bill_payment'
          : 'transfer'),
      serviceId: dto.serviceId,
      metadata: dto.metadata,
    });

    // Monitor transaction confirmation in background
    this.celoService
      .waitForTransaction(dto.txHash as `0x${string}`)
      .then(async (receipt) => {
        if (receipt.status === 'success') {
          await this.transactionsService.updateStatus(dto.txHash, 'success');

          // Check if transaction.toAddress === TREASURY_ADDRESS
          const treasuryAddress = process.env.RONPAY_TREASURY_ADDRESS;
          const isToTreasury =
            dto.toAddress.toLowerCase() === treasuryAddress?.toLowerCase();

          if (
            isToTreasury &&
            dto.metadata &&
            dto.metadata.provider === 'VTPASS'
          ) {
            console.log(
              'Triggering VTPASS purchase for confirmed transaction:',
              dto.txHash,
            );
            try {
              await this.vtpassService.purchaseProduct({
                serviceID: dto.serviceId || 'airtime', // fallback
                billersCode: dto.metadata.recipient, // phone or meter
                variation_code: dto.metadata.variation_code,
                amount: dto.metadata.originalAmountNgn || 100, // Use NGN amount
                phone: dto.metadata.recipient, // For notifications?
                walletAddress: dto.fromAddress,
                request_id: dto.txHash, // Use txHash as idempotency key? Or part of it.
              });
              await this.transactionsService.updateStatus(
                dto.txHash,
                'success_delivered',
              ); // Mark as fully complete
            } catch (err) {
              console.error('VTPASS Execution Failed after payment:', err);
              // We should probably log this critical failure (User paid but didn't get service) -> Manual Refund Needed state
              await this.transactionsService.updateStatus(
                dto.txHash,
                'failed_service_error',
              );
            }
          }
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

  /**
   * Complete VTPASS airtime purchase flow
   * Called after user pays treasury on blockchain
   *
   * Flow:
   * 1. Verify blockchain transaction
   * 2. Validate airtime parameters
   * 3. Trigger VTPASS API to purchase airtime
   * 4. Track transaction in local database
   */
  async purchaseAirtime(dto: {
    txHash: string; // Celo blockchain transaction hash
    phoneNumber: string; // Recipient phone number
    amount: number; // Amount in NGN
    provider: string; // MTN, Airtel, Glo, 9mobile
    walletAddress: string; // Sender's wallet
    memo?: string;
  }) {
    console.log('[PaymentsService] Processing airtime purchase:', {
      txHash: dto.txHash,
      phoneNumber: dto.phoneNumber,
      amount: dto.amount,
      provider: dto.provider,
    });

    // 1. Validate parameters
    const { phone, serviceID, amount } = this.vtpassService.validateAirtimeFlow(
      {
        recipient: dto.phoneNumber,
        amount: dto.amount,
        biller: dto.provider,
      },
    );

    // 2. Call VTPASS to purchase airtime
    try {
      const response = await this.vtpassService.purchaseProduct({
        serviceID,
        billersCode: phone,
        amount,
        phone,
        walletAddress: dto.walletAddress,
      });

      // 3. Format response
      const transactionStatus =
        response.content?.transactions?.status || 'pending';

      return {
        success: transactionStatus === 'delivered',
        message: response.response_description || 'Airtime purchase processing',
        vtpassTransactionId:
          response.content?.transactions?.transactionId || response.requestId,
        localTxHash: response.localTxHash,
        blockchainTxHash: dto.txHash,
        phoneNumber: phone,
        provider: dto.provider,
        amount,
        currency: 'NGN',
        status: transactionStatus,
        transactionDate: new Date(response.transaction_date || Date.now()),
        estimatedDeliveryTime:
          transactionStatus === 'delivered'
            ? 'Airtime delivered successfully'
            : 'Airtime will be delivered in 2-3 minutes',
        fullResponse: response, // Return full response for debugging
      };
    } catch (error) {
      console.error('[PaymentsService] Airtime purchase failed:', error);
      throw new InternalServerErrorException(
        `Failed to process airtime purchase: ${error.message}`,
      );
    }
  }
}
