import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TransactionsService } from '../transactions/transactions.service';

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
    this.baseUrl = this.configService.get<string>('VTPASS_BASE_URL', 'https://sandbox.vtpass.com/api');
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
        this.httpService.get(`${this.baseUrl}/services?identifier=${identifier}`, {
          headers: this.getHeaders(false),
        }),
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
        this.httpService.get(`${this.baseUrl}/service-variations?serviceID=${serviceID}`, {
          headers: this.getHeaders(false),
        }),
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Verify merchant (meter number, smartcard number)
   */
  async verifyMerchant(data: { serviceID: string; billersCode: string; type?: string }) {
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
    // Generate unique request ID if not provided
    const request_id = data.request_id || `ronpay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
        await this.transactionsService.updateStatus(transaction.txHash, 'success');
      } else {
        await this.transactionsService.updateStatus(transaction.txHash, 'failed');
        this.logger.error(`VTPASS Purchase Failed: ${JSON.stringify(responseData)}`);
      }

      return {
        ...responseData,
        transactionId: transaction.id,
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

  private handleError(error: any) {
    this.logger.error(error.response?.data || error.message);
    throw new InternalServerErrorException(
      error.response?.data?.response_description || 'VTPASS API Error',
    );
  }
}
