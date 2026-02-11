import { Receipt, Clock } from "lucide-react";

interface ServiceButtonsProps {
  onPayBills: () => void;
  onHistory: () => void;
}

export function ServiceButtons({ onPayBills, onHistory }: ServiceButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onPayBills}
        className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <Receipt className="h-6 w-6 text-gray-700" />
        <span className="text-sm font-medium text-gray-900">Pay Bills</span>
      </button>
      <button
        onClick={onHistory}
        className="flex flex-col items-center justify-center gap-2 px-4 py-4 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <Clock className="h-6 w-6 text-gray-700" />
        <span className="text-sm font-medium text-gray-900">History</span>
      </button>
    </div>
  );
}
