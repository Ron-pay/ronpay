import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser?: boolean;
  timestamp?: string;
}

export function ChatMessage({
  message,
  isUser = false,
  timestamp,
}: ChatMessageProps) {
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[85%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "bg-green-500 text-white rounded-br-md"
              : "bg-gray-100 text-gray-900 rounded-bl-md",
          )}
        >
          {message}
        </div>
        {timestamp && (
          <p className="text-xs text-gray-500 mt-1 px-1">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
