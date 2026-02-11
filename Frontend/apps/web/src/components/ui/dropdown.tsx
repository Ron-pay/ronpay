"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  value: string;
  options: { value: string; label: string; icon?: string }[];
  onChange: (value: string) => void;
  className?: string;
}

export function Dropdown({
  value,
  options,
  onChange,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium",
          className,
        )}
      >
        {selectedOption?.icon && (
          <span className="text-base">{selectedOption.icon}</span>
        )}
        <span>{selectedOption?.label}</span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-1 right-0 z-20 min-w-[140px] bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors",
                  value === option.value && "bg-green-50 text-green-700",
                )}
              >
                {option.icon && (
                  <span className="text-base">{option.icon}</span>
                )}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
