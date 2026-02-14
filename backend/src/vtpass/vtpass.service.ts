import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TransactionsService } from '../transactions/transactions.service';

// VTPASS Service ID to Provider Mapping
export const VTPASS_AIRTIME_SERVICES: Record<string, string> = {
  MTN: 'airtime-mtn',
  Airtel: 'airtime-airtel',
  Glo: 'airtime-glo',
  '9mobile': 'airtime-9mobile',
} as const;

@Injectable()
export class VtpassService {
  private readonly logger = new Logger(VtpassService.name);
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;
  private publicKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly transactionsService: TransactionsService,
  ) {
    this.baseUrl = this.configService.get<string>(
      'VTPASS_BASE_URL',
      'https://sandbox.vtpass.com/api',
    );
    this.apiKey = this.configService.get<string>('VTPASS_API_KEY') || '';
    this.secretKey = this.configService.get<string>('VTPASS_SECRET_KEY') || '';
    this.publicKey = this.configService.get<string>('VTPASS_PUBLIC_KEY') || '';

    if (!this.apiKey || !this.publicKey) {
      this.logger.warn('VTPASS credentials not fully configured');
    }
  }

  private getHeaders(isPost = false) {
    const headers: any = {
      'api-key': this.apiKey,
    };

    if (isPost) {
      headers['secret-key'] = this.secretKey;
    } else {
      headers['public-key'] = this.publicKey;
    }

    return headers;
  }

  /**
   * Get service categories (airtime, data, tv-subscription, electricity-bill, education)
   */
  async getServiceCategories() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/service-categories`, {
          headers: this.getHeaders(false),
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get services by identifier (e.g., 'airtime', 'data')
   */
  async getServices(identifier: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/services?identifier=${identifier}`,
          {
            headers: this.getHeaders(false),
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get variation codes (e.g., for data bundles)
   */
  async getVariations(serviceID: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/service-variations?serviceID=${serviceID}`,
          {
            headers: this.getHeaders(false),
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Verify merchant (meter number, smartcard number)
   */
  async verifyMerchant(data: {
    serviceID: string;
    billersCode: string;
    type?: string;
  }) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/merchant-verify`, data, {
          headers: this.getHeaders(true),
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Purchase product (Airtime, Data, Bill)
   * RECORDS TRANSACTION HISTORY FOR AI CONTEXT
   */
  async purchaseProduct(data: {
    serviceID: string;
    billersCode: string; // phone number or smartcard or meter
    variation_code?: string; // for data/education
    amount: number;
    phone: string;
    request_id?: string;

    // AI Context
    walletAddress: string; // User's wallet address
  }) {
    // Generate unique request ID if not provided (VTPASS compliant format)
    const request_id = data.request_id || this.generateRequestId();

    const payload = {
      request_id,
      serviceID: data.serviceID,
      billersCode: data.billersCode,
      variation_code: data.variation_code,
      amount: data.amount,
      phone: data.phone,
    };

    // 1. Record preliminary transaction (Pending)
    const transaction = await this.transactionsService.create({
      fromAddress: data.walletAddress,
      toAddress: data.serviceID, // Use serviceID as 'to' for bills
      amount: data.amount,
      currency: 'NGN',
      txHash: `vtpass-${request_id}`,
      status: 'pending',
      type: this.determineTransactionType(data.serviceID),
      serviceId: data.serviceID,
      metadata: {
        billersCode: data.billersCode,
        variation_code: data.variation_code,
        phone: data.phone,
        provider: 'VTPASS',
        vtpassRequestId: request_id,
      },
      intent: `Purchase ${data.serviceID} for ${data.billersCode}`,
      memo: `VTPASS Transaction: ${data.serviceID}`,
    });

    try {
      // 2. Call VTPASS API
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/pay`, payload, {
          headers: this.getHeaders(true),
        }),
      );

      const responseData = response.data;

      // 3. Update Transaction Status
      if (
        responseData.code === '000' ||
        responseData.response_description === 'TRANSACTION SUCCESSFUL'
      ) {
        // Check the actual transaction status in the response
        const transactionStatus = responseData.content?.transactions?.status;
        const finalStatus =
          transactionStatus === 'delivered' ? 'success' : 'pending';

        await this.transactionsService.updateStatus(
          transaction.txHash,
          finalStatus,
        );
      } else {
        await this.transactionsService.updateStatus(
          transaction.txHash,
          'failed',
        );
        this.logger.error(
          `VTPASS Purchase Failed: ${JSON.stringify(responseData)}`,
        );
      }

      return {
        ...responseData,
        transactionId: transaction.id,
        localTxHash: transaction.txHash,
      };
    } catch (error) {
      await this.transactionsService.updateStatus(transaction.txHash, 'failed');
      this.handleError(error);
    }
  }

  private determineTransactionType(serviceID: string): string {
    if (serviceID.includes('airtime')) return 'airtime';
    if (serviceID.includes('data')) return 'data';
    if (serviceID.includes('elect')) return 'electricity';
    if (serviceID.includes('tv')) return 'tv';
    return 'bill_payment';
  }

  /**
   * Generate VTPASS Request ID with proper format
   * Format: YYYYMMDDHHII + alphanumeric string (12+ chars total)
   * Date/Time in Africa/Lagos timezone (GMT+1)
   */
  private generateRequestId(): string {
    const now = new Date();
    // Convert to Lagos timezone (GMT+1)
    const lagosTime = new Date(now.getTime() + 1 * 60 * 60 * 1000);

    const year = lagosTime.getFullYear();
    const month = String(lagosTime.getMonth() + 1).padStart(2, '0');
    const day = String(lagosTime.getDate()).padStart(2, '0');
    const hours = String(lagosTime.getHours()).padStart(2, '0');
    const minutes = String(lagosTime.getMinutes()).padStart(2, '0');

    const dateTimePrefix = `${year}${month}${day}${hours}${minutes}`;
    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 15)
      .toUpperCase();

    return `${dateTimePrefix}${randomSuffix}`;
  }

  /**
   * Map biller name to VTPASS service ID for airtime
   * @param biller Provider name (MTN, Airtel, Glo, 9mobile)
   * @returns VTPASS serviceID (e.g., airtime-mtn)
   */
  mapBillerToServiceId(biller: string): string {
    const normalizedBiller = biller.toUpperCase().trim();
    const serviceId = VTPASS_AIRTIME_SERVICES[normalizedBiller];

    if (!serviceId) {
      throw new BadRequestException(
        `Unsupported provider: ${biller}. Supported: ${Object.keys(VTPASS_AIRTIME_SERVICES).join(', ')}`,
      );
    }

    return serviceId;
  }

  /**
   * Validate phone number format (Nigerian phone numbers)
   * Accepts: 08012345678, +2348012345678
   */
  validatePhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10 && cleaned.startsWith('80')) {
      return `0${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('234')) {
      return `0${cleaned.substring(3)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
      return cleaned;
    }

    throw new BadRequestException(
      `Invalid phone number format: ${phone}. Expected Nigerian format (08012345678 or +2348012345678)`,
    );
  }

  /**
   * Validate airtime purchase parameters
   */
  validateAirtimeFlow(data: {
    recipient: string;
    amount: number;
    biller: string;
  }): { phone: string; serviceID: string; amount: number } {
    if (!data.recipient || !data.amount || !data.biller) {
      throw new BadRequestException(
        'Missing required fields: recipient, amount, biller',
      );
    }

    if (data.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const phone = this.validatePhoneNumber(data.recipient);
    const serviceID = this.mapBillerToServiceId(data.biller);

    return { phone, serviceID, amount: data.amount };
  }

  private handleError(error: any) {
    this.logger.error(error.response?.data || error.message);
    throw new InternalServerErrorException(
      error.response?.data?.response_description || 'VTPASS API Error',
    );
  }
}
