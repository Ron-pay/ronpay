"use client";

import { useState } from "react";
import {
  Loader2,
  Phone,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useSendTransaction } from "wagmi";
import { api } from "@/lib/api";
import { useMiniPayWallet } from "@/hooks/useMiniPayWallet";

const PROVIDERS = ["MTN", "Airtel", "Glo", "9mobile"] as const;
type Provider = (typeof PROVIDERS)[number];

interface AirtimePurchaseFormProps {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
}

export function AirtimePurchaseForm({
  onSuccess,
  onError,
}: AirtimePurchaseFormProps) {
  const { address, isConnected } = useMiniPayWallet();
  const { sendTransaction } = useSendTransaction();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState<Provider>("MTN");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{
    type: "idle" | "parsing" | "signing" | "purchasing" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const validatePhoneNumber = (phone: string): boolean => {
    // Nigerian phone number validation
    const cleaned = phone.replace(/\D/g, "");
    return (
      (cleaned.length === 11 && cleaned.startsWith("0")) ||
      (cleaned.length === 13 && cleaned.startsWith("234"))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      setStatus({
        type: "error",
        message: "Please connect your MiniPay wallet first",
      });
      onError?.("Wallet not connected");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setStatus({
        type: "error",
        message:
          "Invalid phone number. Use format: 08012345678 or +2348012345678",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setStatus({
        type: "error",
        message: "Amount must be greater than 0",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Parse intent directly (bypass AI)
      setStatus({ type: "parsing", message: "Preparing transaction..." });

      const parseResponse = await api.parseIntentDirect(
        {
          action: "buy_airtime",
          recipient: phoneNumber,
          amount: amountNum,
          currency: "NGN",
          biller: provider,
          confidence: 1.0,
        },
        address,
      );

      // Step 2: Sign and send transaction via MiniPay
      setStatus({
        type: "signing",
        message: "Please sign the transaction in MiniPay...",
      });

      sendTransaction(
        {
          to: parseResponse.transaction.to as `0x${string}`,
          value: BigInt(parseResponse.transaction.value),
          data: parseResponse.transaction.data,
        },
        {
          onSuccess: async (hash) => {
            try {
              // Step 3: Trigger airtime purchase
              setStatus({
                type: "purchasing",
                message: "Processing airtime purchase...",
              });

              const purchaseResponse = await api.purchaseAirtime({
                txHash: hash,
                phoneNumber: phoneNumber,
                amount: amountNum,
                provider: provider,
                walletAddress: address,
              });

              setStatus({
                type: "success",
                message: `✅ Airtime purchased successfully! ${amountNum} NGN ${provider} sent to ${phoneNumber}`,
              });

              onSuccess?.(hash);
              setIsProcessing(false);

              // Reset form after 3 seconds
              setTimeout(() => {
                setPhoneNumber("");
                setAmount("");
                setStatus({ type: "idle", message: "" });
              }, 3000);
            } catch (error) {
              const errorMsg =
                error instanceof Error
                  ? error.message
                  : "Failed to purchase airtime";
              setStatus({ type: "error", message: errorMsg });
              onError?.(errorMsg);
              setIsProcessing(false);
            }
          },
          onError: (error) => {
            const errorMsg = error.message || "Transaction failed";
            setStatus({ type: "error", message: errorMsg });
            onError?.(errorMsg);
            setIsProcessing(false);
          },
        },
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to prepare transaction";
      setStatus({ type: "error", message: errorMsg });
      onError?.(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Buy Airtime (Direct)
      </h2>

      {/* Wallet Status */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 mb-1">Connected Wallet</div>
        <div className="font-mono text-sm text-gray-900">
          {isConnected && address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "Not connected"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="08012345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            disabled={isProcessing}
            required
          />
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="inline h-4 w-4 mr-1" />
            Amount (NGN)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            min="1"
            step="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
            disabled={isProcessing}
            required
          />
        </div>

        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Provider
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                disabled={isProcessing}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  provider === p
                    ? "bg-yellow-400 text-gray-900 shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Status Display */}
        {status.type !== "idle" && (
          <div
            className={`p-4 rounded-xl flex items-start gap-3 ${
              status.type === "success"
                ? "bg-green-50 text-green-800"
                : status.type === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : status.type === "error" ? (
              <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <Loader2 className="h-5 w-5 flex-shrink-0 mt-0.5 animate-spin" />
            )}
            <div className="text-sm">{status.message}</div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !isConnected}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Purchase ${amount || "0"} NGN ${provider} Airtime`
          )}
        </button>
      </form>
    </div>
  );
}
