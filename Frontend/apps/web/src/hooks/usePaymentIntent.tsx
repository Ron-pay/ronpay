/**
 * Custom hook for payment intent parsing
 */

import { useState } from "react";
import { api } from "@/lib/api";
import type { ParseIntentResponse } from "@/types/payment";

interface UsePaymentIntentResult {
  data: ParseIntentResponse | null;
  loading: boolean;
  error: string | null;
  parseIntent: (message: string, senderAddress: string) => Promise<void>;
  reset: () => void;
}

export function usePaymentIntent(): UsePaymentIntentResult {
  const [data, setData] = useState<ParseIntentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseIntent = async (message: string, senderAddress: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await api.parsePaymentIntent(message, senderAddress);
      setData(result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to parse payment intent";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    parseIntent,
    reset,
  };
}
