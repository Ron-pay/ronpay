/**
 * Balance Display Component
 * Shows wallet balances for all supported tokens
 */

"use client";

import { useEffect, useState } from "react";
import { Wallet, Loader2, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { TokenBalance } from "@/types/payment";

interface BalanceDisplayProps {
  address: string;
}

export function BalanceDisplay({ address }: BalanceDisplayProps) {
  const [balances, setBalances] = useState<TokenBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.getBalance(address);
      setBalances(response.balances);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch balances";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading balances...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={fetchBalances}
          className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  const tokenList = [
    { symbol: "cUSD", name: "Celo Dollar", value: balances?.cUSD || 0 },
    { symbol: "CELO", name: "Celo", value: balances?.CELO || 0 },
    { symbol: "cKES", name: "Kenyan Shilling", value: balances?.cKES || 0 },
    { symbol: "cEUR", name: "Celo Euro", value: balances?.cEUR || 0 },
    { symbol: "cREAL", name: "Brazilian Real", value: balances?.cREAL || 0 },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-500" />
          <span className="font-semibold text-gray-900">Your Balances</span>
        </div>
        <button
          onClick={fetchBalances}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh balances"
        >
          <RefreshCw className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Wallet Address */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
        <p className="font-mono text-xs text-gray-900">
          {address.slice(0, 10)}...{address.slice(-8)}
        </p>
      </div>

      {/* Token Balances */}
      <div className="space-y-2">
        {tokenList.map((token) => (
          <div
            key={token.symbol}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div>
              <p className="font-medium text-gray-900">{token.symbol}</p>
              <p className="text-xs text-gray-500">{token.name}</p>
            </div>
            <p className="font-semibold text-gray-900">
              {token.value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
