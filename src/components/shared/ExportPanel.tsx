import { useState } from 'react';
import { FileText, Printer, Download, X, Calendar, CheckSquare, RotateCcw } from 'lucide-react';
import Tooltip from './Tooltip';

interface ExportSection {
  id: string;
  label: string;
  checked: boolean;
}

interface ExportPanelProps {
  title?: string;
  reportTitle?: string;
  onExport?: (format: 'pdf' | 'print', sections: string[]) => void;
}

export default function ExportPanel({
  title = 'Export Report',
  reportTitle = 'Analysis Report',
  onExport,
}: ExportPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sections, setSections] = useState<ExportSection[]>([
    { id: 'summary', label: 'Executive Summary', checked: true },
    { id: 'metrics', label: 'Key Metrics & KPIs', checked: true },
    { id: 'comparison', label: 'Current vs. Scenario Comparison', checked: true },
    { id: 'impacts', label: 'Impact Analysis', checked: true },
    { id: 'charts', label: 'Charts & Visualizations', checked: true },
    { id: 'recommendations', label: 'Recommendations', checked: false },
    { id: 'rawdata', label: 'Raw Data Tables', checked: false },
  ]);

  const toggleSection = (id: string) => {
    setSections(prev =>
      prev.map(s => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  };

  const handleExport = (format: 'pdf' | 'print') => {
    const selectedSections = sections.filter(s => s.checked).map(s => s.id);

    if (format === 'print') {
      const printContent = document.getElementById('printable-content');
      if (printContent) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${reportTitle}</title>
                <style>
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    padding: 40px;
                    max-width: 1000px;
                    margin: 0 auto;
                    color: #1f2937;
                  }
                  .report-header {
                    text-align: center;
                    margin-bottom: 32px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #e5e7eb;
                  }
                  .report-header h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin: 0 0 8px 0;
                  }
                  .report-header .date {
                    color: #6b7280;
                    font-size: 14px;
                  }
                  .section {
                    margin-bottom: 24px;
                    page-break-inside: avoid;
                  }
                  .section h2 {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 12px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e5e7eb;
                  }
                  table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 8px;
                  }
                  th, td {
                    padding: 8px 12px;
                    text-align: left;
                    border: 1px solid #e5e7eb;
                  }
                  th {
                    background: #f9fafb;
                    font-weight: 600;
                  }
                  .metric-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-top: 12px;
                  }
                  .metric-card {
                    padding: 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                  }
                  .metric-card .label {
                    font-size: 12px;
                    color: #6b7280;
                    margin-bottom: 4px;
                  }
                  .metric-card .value {
                    font-size: 20px;
                    font-weight: 700;
                  }
                  .positive { color: #059669; }
                  .negative { color: #dc2626; }
                  @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body>
                <div class="report-header">
                  <h1>${reportTitle}</h1>
                  <p class="date">Generated: ${new Date().toLocaleString()}</p>
                </div>
                ${printContent.innerHTML}
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
    }

    onExport?.(format, selectedSections);
    setIsOpen(false);
  };

  const selectAll = () => {
    setSections(prev => prev.map(s => ({ ...s, checked: true })));
  };

  const selectNone = () => {
    setSections(prev => prev.map(s => ({ ...s, checked: false })));
  };

  return (
    <>
      <Tooltip content="Export as PDF or Print">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </Tooltip>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-surface-200">
              <h2 className="text-lg font-semibold text-surface-900">{title}</h2>
              <Tooltip content="Close export panel">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-surface-400 hover:text-surface-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-2 mb-4 text-sm text-surface-500">
                <Calendar className="w-4 h-4" />
                <span>Report Date: {new Date().toLocaleDateString()}</span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-surface-700">Include Sections:</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={selectAll}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Select All
                    </button>
                    <span className="text-surface-300">|</span>
                    <button
                      onClick={selectNone}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Select None
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {sections.map(section => (
                    <label
                      key={section.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-50 cursor-pointer"
                    >
                      <div
                        onClick={() => toggleSection(section.id)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          section.checked
                            ? 'bg-primary-500 border-primary-500'
                            : 'border-surface-300'
                        }`}
                      >
                        {section.checked && (
                          <CheckSquare className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-surface-700">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-surface-200 bg-surface-50">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setSections([
                    { id: 'summary', label: 'Executive Summary', checked: true },
                    { id: 'metrics', label: 'Key Metrics & KPIs', checked: true },
                    { id: 'comparison', label: 'Current vs. Scenario Comparison', checked: true },
                    { id: 'impacts', label: 'Impact Analysis', checked: true },
                    { id: 'charts', label: 'Charts & Visualizations', checked: true },
                    { id: 'recommendations', label: 'Recommendations', checked: false },
                    { id: 'rawdata', label: 'Raw Data Tables', checked: false },
                  ])}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip content="Open print dialog">
                  <button
                    onClick={() => handleExport('print')}
                    disabled={!sections.some(s => s.checked)}
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-surface-200 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                </Tooltip>
                <Tooltip content="Download as PDF">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={!sections.some(s => s.checked)}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
