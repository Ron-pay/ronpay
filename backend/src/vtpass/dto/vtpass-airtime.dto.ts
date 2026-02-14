import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

/**
 * DTO for purchasing airtime via VTPASS
 * Used after user signs and broadcasts the transaction to treasury
 */
export class PurchaseAirtimeDto {
  @IsString()
  @IsNotEmpty()
  txHash: string; // Transaction hash from Celo blockchain (payment to treasury)

  @IsString()
  @IsNotEmpty()
  phoneNumber: string; // Recipient phone number (08012345678 or +2348012345678)

  @IsNumber()
  @IsPositive()
  amount: number; // Amount in NGN (e.g., 1000)

  @IsString()
  @IsNotEmpty()
  provider: string; // MTN, Airtel, Glo, 9mobile

  @IsString()
  @IsNotEmpty()
  walletAddress: string; // Sender's wallet address (for transaction tracking)

  @IsOptional()
  @IsString()
  memo?: string; // Optional memo
}

/**
 * Response DTO for airtime purchase confirmation
 */
export class AirtimePurchaseResponseDto {
  success: boolean;
  message: string;
  vtpassTransactionId: string; // VTPASS transaction ID
  localTxHash: string; // Local RonPay transaction hash
  blockchainTxHash: string; // Celo blockchain transaction hash
  phoneNumber: string;
  provider: string;
  amount: number;
  currency: string; // NGN
  status: 'initiated' | 'pending' | 'delivered' | 'failed';
  transactionDate: Date;
  estimatedDeliveryTime?: string; // e.g., "Airtime will be delivered in 2-3 minutes"
}

/**
 * VTPASS Payment Request Payload (Internal)
 */
export class VtpassPaymentPayloadDto {
  request_id: string; // YYYYMMDDHHII + alphanumeric (min 12 chars)
  serviceID: string; // airtime-mtn, airtime-airtel, etc.
  billersCode: string; // Phone number
  amount: number; // Amount in NGN
  phone: string; // Recipient phone
  variation_code?: string; // For data/education bundles
}

/**
 * VTPASS API Response
 */
export class VtpassApiResponseDto {
  response_description: string; // "TRANSACTION SUCCESSFUL" or error description
  code: string; // "000" for success
  content?: {
    transactions: {
      status: 'initiated' | 'pending' | 'delivered'; // Final status
      product_name: string; // "MTN Airtime VTU"
      unique_element: string; // Phone number
      amount: number;
      transactionId: string; // VTPASS transaction ID
      phone: string;
    };
  };
  requestId: string;
  amount: number;
  transaction_date: string;
}
