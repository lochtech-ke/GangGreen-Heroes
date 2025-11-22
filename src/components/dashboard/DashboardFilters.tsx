import { Filter, Calendar, Download, Loader } from 'lucide-react';

type ForestType = 'kakamega' | 'karura' | 'mau' | 'all';

interface DashboardFiltersProps {
  selectedForest: ForestType;
  trendDays: number;
  onForestChange: (forest: ForestType) => void;
  onTrendDaysChange: (days: number) => void;
  onGenerateReport: () => void;
  generatingReport: boolean;
}

export function DashboardFilters({
  selectedForest,
  trendDays,
  onForestChange,
  onTrendDaysChange,
  onGenerateReport,
  generatingReport
}: DashboardFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Forest Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500 w-5 h-5" />
            <select
              value={selectedForest}
              onChange={(e) => onForestChange(e.target.value as ForestType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Forests</option>
              <option value="kakamega">Kakamega Forest</option>
              <option value="karura">Karura Forest</option>
              <option value="mau">Mau Forest</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-500 w-5 h-5" />
            <select
              value={trendDays}
              onChange={(e) => onTrendDaysChange(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>
        </div>

        {/* Generate Report Button */}
        <button
          onClick={onGenerateReport}
          disabled={generatingReport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {generatingReport ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  );
}