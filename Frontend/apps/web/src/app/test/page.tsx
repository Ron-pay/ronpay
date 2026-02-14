"use client";

import { AirtimePurchaseForm } from "@/components/payment/AirtimePurchaseForm";
import { ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

export default function TestPage() {
  const handleSuccess = (txHash: string) => {
    console.log("✅ Airtime purchase successful!", txHash);
  };

  const handleError = (error: string) => {
    console.error("❌ Airtime purchase failed:", error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">
              Direct Airtime Purchase
            </h1>
            <p className="text-xs text-gray-600">Test page - No AI required</p>
          </div>
          <Zap className="h-6 w-6 text-yellow-500" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-semibold text-blue-900 mb-2">
            🧪 Test Mode Active
          </h3>
          <p className="text-sm text-blue-800">
            This page allows you to purchase airtime directly without AI
            interaction. Simply fill in the form below and confirm the
            transaction in your MiniPay wallet.
          </p>
        </div>

        {/* Airtime Purchase Form */}
        <AirtimePurchaseForm onSuccess={handleSuccess} onError={handleError} />

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-3">How it works:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">1.</span>
              <span>Enter the phone number to receive airtime</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">2.</span>
              <span>Enter the amount in Nigerian Naira (NGN)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">3.</span>
              <span>Select your network provider (MTN, Airtel, Glo, 9mobile)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">4.</span>
              <span>Click "Purchase Airtime" and sign the transaction</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-yellow-600">5.</span>
              <span>Wait for confirmation - airtime will be delivered instantly!</span>
            </li>
          </ol>
        </div>

        {/* Supported Providers */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">
            Supported Providers:
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">MTN</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Airtel</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">Glo</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-900">9mobile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
