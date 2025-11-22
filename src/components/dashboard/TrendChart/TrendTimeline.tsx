import { TrendData } from '../../../services/dashboard.service';

interface TrendTimelineProps {
  trendData: TrendData[];
}

export function TrendTimeline({ trendData }: TrendTimelineProps) {
  if (trendData.length === 0) return null;

  const startDate = trendData[0]?.date;
  const midDate = trendData[Math.floor(trendData.length / 2)]?.date;
  const endDate = trendData[trendData.length - 1]?.date;

  return (
    <div className="mt-6 pt-6 border-t">
      <div className="text-sm text-gray-600 mb-2">Timeline</div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{startDate}</span>
        <span>{midDate}</span>
        <span>{endDate}</span>
      </div>
    </div>
  );
}