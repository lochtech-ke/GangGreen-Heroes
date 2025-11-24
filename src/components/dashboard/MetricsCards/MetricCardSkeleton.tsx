/**
 * MetricCardSkeleton Component
 * Loading skeleton for metric cards
 */

export function MetricCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-400 rounded-full" />
        <div className="text-right">
          <div className="h-8 w-20 bg-gray-400 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-400 rounded" />
        </div>
      </div>
      <div className="h-3 w-32 bg-gray-400 rounded" />
    </div>
  );
}