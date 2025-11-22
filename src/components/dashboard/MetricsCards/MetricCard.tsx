interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  gradient: string;
  sublabel?: string;
}

export function MetricCard({
  icon,
  value,
  label,
  gradient,
  sublabel
}: MetricCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="opacity-80">{icon}</div>
        <div className="text-right">
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{label}</div>
        </div>
      </div>
      {sublabel && (
        <div className="text-xs opacity-75">{sublabel}</div>
      )}
    </div>
  );
}