"use client";

import * as React from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { QuickActions } from "@/components/chat/QuickActions";
import { ServiceButtons } from "@/components/chat/ServiceButtons";
import { ChatInput } from "@/components/chat/ChatInput";
import { PurchaseCard } from "@/components/chat/PurchaseCard";
import { BottomNav } from "@/components/chat/BottomNav";
import { PaymentIntentDisplay } from "@/components/payment/PaymentIntentDisplay";
import { PaymentConfirmation } from "@/components/payment/PaymentConfirmation";
import { BalanceDisplay } from "@/components/payment/BalanceDisplay";
import { useMiniPayWallet } from "@/hooks/useMiniPayWallet";
import { usePaymentIntent } from "@/hooks/usePaymentIntent";
import type { ParseIntentResponse } from "@/types/payment";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp?: string;
}

interface Purchase {
  service: {
    name: string;
    icon: string;
    provider?: string;
  };
  recipient: string;
  amount: string;
  currency: string;
}

export default function Home() {
  const [country, setCountry] = React.useState("ghana");
  const [token, setToken] = React.useState("usdt");
  const [activeTab, setActiveTab] = React.useState("home");
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      text: "Hello! 👋 I'm ready to help. Select your country and preferred payment token above to get started with instant transactions.",
      isUser: false,
      timestamp: "Today, 9:41 AM",
    },
  ]);
  const [pendingPurchase, setPendingPurchase] = React.useState<Purchase | null>(
    null,
  );
  const [parsedIntent, setParsedIntent] =
    React.useState<ParseIntentResponse | null>(null);
  const [showBalance, setShowBalance] = React.useState(false);

  const { address, isConnected } = useMiniPayWallet();
  const { data, loading, error, parseIntent, reset } = usePaymentIntent();

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Reset previous states
    setParsedIntent(null);
    setShowBalance(false);
    reset();

    // Check if wallet is connected
    if (!isConnected || !address) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "⚠️ Please connect your MiniPay wallet to continue.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Parse payment intent with AI
    await parseIntent(text, address);
  };

  // Handle AI parsing results
  React.useEffect(() => {
    if (data) {
      setParsedIntent(data);

      // Add AI response message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: `✅ I understood your request: ${data.intent.action.replace(
          "_",
          " ",
        )}`,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Handle check_balance action
      if (data.intent.action === "check_balance") {
        setShowBalance(true);
      }
    }

    if (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `❌ ${error}`,
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [data, error]);

  const handleBuyAirtime = () => {
    const message = "I want to buy airtime";
    handleSendMessage(message);
  };

  const handleBuyData = () => {
    const message = "I want to buy 5GB MTN data";
    handleSendMessage(message);

    // Show purchase confirmation after a delay
    setTimeout(() => {
      setPendingPurchase({
        service: {
          name: "5GB Monthly Plan",
          icon: "📊",
          provider: "Data Bundle",
        },
        recipient: "0803 *** 8921",
        amount: "1,500",
        currency: "₦",
      });
    }, 2000);
  };

  const handlePayBills = () => {
    handleSendMessage("I want to pay bills");
  };

  const handleHistory = () => {
    setActiveTab("history");
  };

  const handleConfirmPurchase = () => {
    // Handle purchase confirmation
    setPendingPurchase(null);
    const confirmMessage: Message = {
      id: Date.now().toString(),
      text: "✅ Purchase confirmed! Your data bundle has been activated.",
      isUser: false,
    };
    setMessages((prev) => [...prev, confirmMessage]);
  };

  const handleCancelPurchase = () => {
    setPendingPurchase(null);
  };

  const handlePaymentSuccess = (txHash: string) => {
    setParsedIntent(null);
    const successMessage: Message = {
      id: Date.now().toString(),
      text: `✅ Payment sent successfully! Transaction: ${txHash.slice(
        0,
        10,
      )}...`,
      isUser: false,
    };
    setMessages((prev) => [...prev, successMessage]);
  };

  const handleCancelPayment = () => {
    setParsedIntent(null);
    const cancelMessage: Message = {
      id: Date.now().toString(),
      text: "Payment cancelled.",
      isUser: false,
    };
    setMessages((prev) => [...prev, cancelMessage]);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50">
      {/* Header */}
      <ChatHeader
        country={country}
        token={token}
        onCountryChange={setCountry}
        onTokenChange={setToken}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="space-y-3">
            <QuickActions
              onBuyAirtime={handleBuyAirtime}
              onBuyData={handleBuyData}
            />
            <ServiceButtons
              onPayBills={handlePayBills}
              onHistory={handleHistory}
            />
          </div>
        )}

        {/* Purchase Confirmation */}
        {pendingPurchase && (
          <PurchaseCard
            service={pendingPurchase.service}
            recipient={pendingPurchase.recipient}
            amount={pendingPurchase.amount}
            currency={pendingPurchase.currency}
            onConfirm={handleConfirmPurchase}
            onCancel={handleCancelPurchase}
          />
        )}

        {/* AI Payment Intent Display */}
        {parsedIntent && parsedIntent.intent.action !== "check_balance" && (
          <PaymentIntentDisplay intent={parsedIntent.intent} />
        )}

        {/* Payment Confirmation for send_payment */}
        {parsedIntent &&
          parsedIntent.intent.action === "send_payment" &&
          address && (
            <PaymentConfirmation
              parsedCommand={parsedIntent.parsedCommand}
              transaction={parsedIntent.transaction}
              senderAddress={address}
              onSuccess={handlePaymentSuccess}
              onCancel={handleCancelPayment}
            />
          )}

        {/* Balance Display for check_balance */}
        {showBalance && address && <BalanceDisplay address={address} />}
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
