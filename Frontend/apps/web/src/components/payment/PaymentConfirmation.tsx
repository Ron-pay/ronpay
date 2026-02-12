/**
 * Payment Confirmation Component
 * Handles payment confirmation and MiniPay transaction signing
 */

"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import type { ParsedCommand, TransactionData } from "@/types/payment";
import { api } from "@/lib/api";

interface PaymentConfirmationProps {
  parsedCommand: ParsedCommand;
  transaction: TransactionData;
  senderAddress: string;
  onSuccess: (txHash: string) => void;
  onCancel: () => void;
}

export function PaymentConfirmation({
  parsedCommand,
  transaction,
  senderAddress,
  onSuccess,
  onCancel,
}: PaymentConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { sendTransaction } = useSendTransaction();

  const handleConfirm = async () => {
    setIsProcessing(true);

    try {
      // Send transaction via MiniPay
      sendTransaction(
        {
          to: transaction.to as `0x${string}`,
          value: BigInt(transaction.value),
          data: transaction.data,
        },
        {
          onSuccess: async (hash) => {
            // Record transaction in backend
            try {
              await api.executePayment({
                fromAddress: senderAddress,
                toAddress: parsedCommand.recipient,
                amount: parsedCommand.amount,
                currency: parsedCommand.currency,
                txHash: hash,
                memo: parsedCommand.memo,
              });
              onSuccess(hash);
            } catch (error) {
              console.error("Failed to record transaction:", error);
              // Still consider it a success since tx was sent
              onSuccess(hash);
            }
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            setIsProcessing(false);
          },
        },
      );
    } catch (error) {
      console.error("Payment confirmation error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium text-green-700">
          CONFIRM PAYMENT
        </span>
      </div>

      {/* Payment Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">To:</span>
          <span className="font-mono text-xs font-medium text-gray-900">
            {parsedCommand.recipient.slice(0, 6)}...
            {parsedCommand.recipient.slice(-4)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-green-600">
            {parsedCommand.amount} {parsedCommand.currency}
          </span>
        </div>
        {parsedCommand.memo && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Memo:</span>
            <span className="font-medium text-gray-900">
              {parsedCommand.memo}
            </span>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={isProcessing}
        className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${parsedCommand.amount} ${parsedCommand.currency}`
        )}
      </button>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        disabled={isProcessing}
        className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
