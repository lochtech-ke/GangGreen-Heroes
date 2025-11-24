interface TrendBarProps {
  label: string;
  value: number | string;
  percentage: number;
  color: string;
}

export function TrendBar({ label, value, percentage, color }: TrendBarProps) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all ${color.replace('text-', 'bg-')}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}