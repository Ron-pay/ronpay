interface QuickActionsProps {
  onBuyAirtime: () => void;
  onBuyData: () => void;
}

export function QuickActions({ onBuyAirtime, onBuyData }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={onBuyAirtime}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-sm"
      >
        <span className="text-lg">📱</span>
        <span>Buy Airtime</span>
      </button>
      <button
        onClick={onBuyData}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-medium transition-colors shadow-sm"
      >
        <span className="text-lg">📊</span>
        <span>Buy Data</span>
      </button>
    </div>
  );
}
