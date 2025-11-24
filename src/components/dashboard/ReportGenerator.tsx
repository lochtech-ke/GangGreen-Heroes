/**
 * ReportGenerator Component
 * Standalone component for report generation with download
 */

import { Download, Loader, FileText } from 'lucide-react';
import { useState } from 'react';
import { dashboardService } from '../../services/dashboard.service';

type ForestType = 'kakamega' | 'karura' | 'mau' | 'all';

interface ReportGeneratorProps {
  selectedForest: ForestType;
  onError?: (error: string) => void;
}

export function ReportGenerator({ selectedForest, onError }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const reportData = await dashboardService.generateReportData(selectedForest);
      
      // Here you would integrate with a PDF generation library
      // For now, we'll just log the data
      console.log('Report Data:', reportData);
      
      setReportReady(true);
      
      // Auto-reset after 3 seconds
      setTimeout(() => setReportReady(false), 3000);
      
    } catch (err: any) {
      if (onError) {
        onError(err.message || 'Failed to generate report');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    // In production, trigger PDF download
    alert('PDF download would start here');
    setReportReady(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="w-6 h-6 text-green-600" />
        <h3 className="text-lg font-bold text-gray-800">
          Impact Report
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Generate a comprehensive PDF report of conservation impact metrics, 
        trends, and forest statistics.
      </p>

      {reportReady ? (
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      ) : (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {generating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              Generate Report
            </>
          )}
        </button>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Report includes: Impact metrics, trend analysis, forest comparison, 
        and recent activities for {selectedForest === 'all' ? 'all forests' : selectedForest}.
      </div>
    </div>
  );
}