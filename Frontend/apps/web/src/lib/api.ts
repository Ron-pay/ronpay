/**
 * API Service for RonPay Backend
 * Handles communication with NestJS backend
 */

import type {
  ParseIntentResponse,
  BalanceResponse,
  ExecutePaymentRequest,
  ApiError,
} from "@/types/payment";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

class ApiService {
  /**
   * Parse natural language payment intent
   */
  async parsePaymentIntent(
    message: string,
    senderAddress: string,
  ): Promise<ParseIntentResponse> {
    try {
      const response = await fetch(`${BACKEND_URL}/payments/parse-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          senderAddress,
        }),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || "Failed to parse payment intent");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Payment parsing failed: ${error.message}`);
      }
      throw new Error("Failed to connect to payment service");
    }
  }

  /**
   * Get wallet balance for all supported tokens
   */
  async getBalance(address: string): Promise<BalanceResponse> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/payments/balance/${address}`,
      );

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || "Failed to fetch balance");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Balance fetch failed: ${error.message}`);
      }
      throw new Error("Failed to connect to payment service");
    }
  }

  /**
   * Record executed payment transaction
   */
  async executePayment(
    data: ExecutePaymentRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/payments/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || "Failed to record payment");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Payment execution failed: ${error.message}`);
      }
      throw new Error("Failed to connect to payment service");
    }
  }

  /**
   * Parse payment intent directly (bypasses AI)
   */
  async parseIntentDirect(
    intent: any,
    senderAddress: string,
  ): Promise<ParseIntentResponse> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/payments/parse-intent-direct`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            intent,
            senderAddress,
          }),
        },
      );

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(
          error.message || "Failed to parse payment intent directly",
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Direct intent parsing failed: ${error.message}`);
      }
      throw new Error("Failed to connect to payment service");
    }
  }

  /**
   * Purchase airtime after payment to treasury
   */
  async purchaseAirtime(data: {
    txHash: string;
    phoneNumber: string;
    amount: number;
    provider: string;
    walletAddress: string;
    memo?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${BACKEND_URL}/payments/purchase-airtime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || "Failed to purchase airtime");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Airtime purchase failed: ${error.message}`);
      }
      throw new Error("Failed to connect to payment service");
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/payments/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();
