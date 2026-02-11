import { CheckCircle2 } from "lucide-react";

interface PurchaseCardProps {
  service: {
    name: string;
    icon: string;
    provider?: string;
  };
  recipient: string;
  amount: string;
  currency: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function PurchaseCard({
  service,
  recipient,
  amount,
  currency,
  onConfirm,
  onCancel,
}: PurchaseCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <span className="text-sm font-medium text-green-700">
          CONFIRM PURCHASE
        </span>
      </div>

      {/* Service Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl">
          {service.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{service.name}</h3>
          {service.provider && (
            <p className="text-sm text-gray-500">{service.provider}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Recipient:</span>
          <span className="font-medium text-gray-900">{recipient}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-green-600">
            {currency}
            {amount}
          </span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onConfirm}
        className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
      >
        Pay {currency}
        {amount}
      </button>

      {/* Cancel Button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full mt-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
