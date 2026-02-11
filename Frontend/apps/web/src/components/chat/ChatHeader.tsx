"use client";

import { Avatar } from "@/components/ui/avatar";
import { Dropdown } from "@/components/ui/dropdown";
import { MoreVertical } from "lucide-react";

interface ChatHeaderProps {
  country: string;
  token: string;
  onCountryChange: (country: string) => void;
  onTokenChange: (token: string) => void;
}

const countries = [
  { value: "ghana", label: "Ghana", icon: "🇬🇭" },
  { value: "nigeria", label: "Nigeria", icon: "🇳🇬" },
  { value: "kenya", label: "Kenya", icon: "🇰🇪" },
];

const tokens = [
  { value: "usdt", label: "USDT", icon: "💵" },
  { value: "celo", label: "CELO", icon: "💚" },
  { value: "cusd", label: "cUSD", icon: "💲" },
];

export function ChatHeader({
  country,
  token,
  onCountryChange,
  onTokenChange,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Profile Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              src="/ronpay-avatar.png"
              alt="RonPay Assistant"
              fallback="R"
              className="h-11 w-11"
            />
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              RonPay Assistant
            </h1>
            <p className="text-xs text-gray-500">
              Always Helpful • Powered by AI
            </p>
          </div>
        </div>

        {/* More Options */}
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Country and Token Selectors */}
      <div className="flex items-center gap-2 mt-3">
        <Dropdown
          value={country}
          options={countries}
          onChange={onCountryChange}
        />
        <Dropdown value={token} options={tokens} onChange={onTokenChange} />
      </div>
    </header>
  );
}
