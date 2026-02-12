/**
 * Payment Intent Display Component
 * Shows parsed payment intent with visual feedback
 */

import { ArrowUpRight, Wallet, CreditCard, AlertCircle } from "lucide-react";
import type { PaymentIntent } from "@/types/payment";

interface PaymentIntentDisplayProps {
  intent: PaymentIntent;
}

export function PaymentIntentDisplay({ intent }: PaymentIntentDisplayProps) {
  const getActionIcon = () => {
    switch (intent.action) {
      case "send_payment":
        return <ArrowUpRight className="h-5 w-5" />;
      case "check_balance":
        return <Wallet className="h-5 w-5" />;
      case "pay_bill":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getActionLabel = () => {
    switch (intent.action) {
      case "send_payment":
        return "Send Payment";
      case "check_balance":
        return "Check Balance";
      case "pay_bill":
        return "Pay Bill";
      default:
        return "Unknown Action";
    }
  };

  const getConfidenceColor = () => {
    if (!intent.confidence) return "text-gray-500";
    if (intent.confidence >= 0.8) return "text-green-600";
    if (intent.confidence >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBgColor = () => {
    if (!intent.confidence) return "bg-gray-100";
    if (intent.confidence >= 0.8) return "bg-green-50";
    if (intent.confidence >= 0.5) return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <div
      className={`rounded-2xl p-4 border ${getConfidenceBgColor()} border-gray-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${getConfidenceBgColor()}`}>
            {getActionIcon()}
          </div>
          <span className="font-semibold text-gray-900">
            {getActionLabel()}
          </span>
        </div>
        {intent.confidence && (
          <span className={`text-xs font-medium ${getConfidenceColor()}`}>
            {Math.round(intent.confidence * 100)}% confident
          </span>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        {intent.recipient && (
          <div className="flex justify-between">
            <span className="text-gray-600">Recipient:</span>
            <span className="font-medium text-gray-900 font-mono text-xs">
              {intent.recipient.slice(0, 6)}...{intent.recipient.slice(-4)}
            </span>
          </div>
        )}
        {intent.amount && (
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-green-600">
              {intent.amount} {intent.currency || "cUSD"}
            </span>
          </div>
        )}
        {intent.memo && (
          <div className="flex justify-between">
            <span className="text-gray-600">Memo:</span>
            <span className="font-medium text-gray-900">{intent.memo}</span>
          </div>
        )}
      </div>
    </div>
  );
}
