interface ForestStatRowProps {
  label: string;
  value: string | number;
  color: string;
}

export function ForestStatRow({ label, value, color }: ForestStatRowProps) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
}