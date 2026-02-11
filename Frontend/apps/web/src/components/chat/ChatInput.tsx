"use client";

import * as React from "react";
import { Plus, Mic, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  placeholder = "Type a message...",
}: ChatInputProps) {
  const [message, setMessage] = React.useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3">
      <div className="flex items-center gap-2">
        {/* Attachment Button */}
        <button className="flex-shrink-0 p-2 bg-yellow-400 hover:bg-yellow-500 rounded-full transition-colors">
          <Plus className="h-5 w-5 text-gray-900" />
        </button>

        {/* Input Field */}
        <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-500"
          />
          <button className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-full transition-colors">
            <Mic className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="flex-shrink-0 p-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors"
        >
          <Send className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}
