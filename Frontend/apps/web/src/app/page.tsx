"use client";

import * as React from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { QuickActions } from "@/components/chat/QuickActions";
import { ServiceButtons } from "@/components/chat/ServiceButtons";
import { ChatInput } from "@/components/chat/ChatInput";
import { PurchaseCard } from "@/components/chat/PurchaseCard";
import { BottomNav } from "@/components/chat/BottomNav";

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

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I understand you want to make a purchase. Let me help you with that!",
        isUser: false,
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

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
      </div>

      {/* Chat Input */}
      <ChatInput onSend={handleSendMessage} />

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
