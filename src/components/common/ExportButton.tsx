import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

export interface ExportButtonProps {
  data: any[];
  filename: string;
  formats?: ('csv' | 'pdf')[];
  className?: string;
  onExport?: (format: 'csv' | 'pdf') => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  formats = ['csv', 'pdf'],
  className = '',
  onExport,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    if (data.length === 0) return;

    setExporting(true);
    
    try {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      onExport?.('csv');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    
    try {
      // For now, we'll create a simple HTML table and print it
      // In a production app, you'd use a library like jsPDF
      const headers = Object.keys(data[0]);
      const tableHTML = `
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #10b981; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #10b981; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>${filename}</h1>
            <table>
              <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${data.map(row => `
                  <tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(tableHTML);
        printWindow.document.close();
        printWindow.print();
      }

      onExport?.('pdf');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setExporting(false);
      setShowMenu(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportToCSV();
    } else {
      exportToPDF();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting || data.length === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download size={18} />
        <span className="text-sm font-medium">
          {exporting ? 'Exporting...' : 'Export'}
        </span>
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-200 z-50 overflow-hidden">
            {formats.includes('csv') && (
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <FileSpreadsheet size={18} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Export as CSV</span>
              </button>
            )}

            {formats.includes('pdf') && (
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <FileText size={18} className="text-red-600" />
                <span className="text-sm font-medium text-gray-700">Export as PDF</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;
