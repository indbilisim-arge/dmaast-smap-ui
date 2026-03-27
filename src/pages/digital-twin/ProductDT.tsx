import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { useRole } from '../../contexts/RoleContext';
import AdminVisible from '../../components/shared/AdminVisible';
import { Package, AlertTriangle, CheckCircle, Search, Layers, Info, X, FileText } from 'lucide-react';
import Header from '../../components/layout/Header';
import HelpPopover from '../../components/shared/HelpPopover';
import TooltipUI from '../../components/shared/Tooltip';
import FilterBar from '../../components/shared/FilterBar';
import KpiCard from '../../components/shared/KpiCard';
import type { KpiData } from '../../types';

const productKpis: KpiData[] = [
  {
    id: 'yield-rate',
    label: 'Yield Rate',
    value: 98.2,
    unit: '%',
    trend: 0.5,
    target: 99,
    cluster: 'cost',
    sparklineData: [97, 97.5, 97.8, 98, 98, 98.1, 98.2, 98.2],
  },
  {
    id: 'defect-rate',
    label: 'Defect Rate',
    value: 1.8,
    unit: '%',
    trend: -0.3,
    target: 1.5,
    cluster: 'cost',
    sparklineData: [2.5, 2.3, 2.2, 2.0, 1.9, 1.9, 1.8, 1.8],
  },
  {
    id: 'first-pass-yield',
    label: 'First Pass Yield',
    value: 96.5,
    unit: '%',
    trend: 1.2,
    target: 98,
    cluster: 'cost',
    sparklineData: [94, 94.5, 95, 95.5, 96, 96.2, 96.4, 96.5],
  },
  {
    id: 'rework-rate',
    label: 'Rework Rate',
    value: 2.4,
    unit: '%',
    trend: -0.8,
    target: 2.0,
    cluster: 'cost',
    sparklineData: [4.0, 3.5, 3.2, 3.0, 2.8, 2.6, 2.5, 2.4],
  },
];

const defectTypeData = [
  { type: 'Surface', count: 45, percentage: 32 },
  { type: 'Dimensional', count: 38, percentage: 27 },
  { type: 'Assembly', count: 28, percentage: 20 },
  { type: 'Electrical', count: 18, percentage: 13 },
  { type: 'Other', count: 11, percentage: 8 },
];

const qualityTrendData = [
  { batch: 'B-001', yield: 97.5, defects: 2.5 },
  { batch: 'B-002', yield: 98.0, defects: 2.0 },
  { batch: 'B-003', yield: 97.8, defects: 2.2 },
  { batch: 'B-004', yield: 98.3, defects: 1.7 },
  { batch: 'B-005', yield: 98.1, defects: 1.9 },
  { batch: 'B-006', yield: 98.5, defects: 1.5 },
  { batch: 'B-007', yield: 98.2, defects: 1.8 },
];

const productVariants = [
  { id: 'PRD-A', name: 'Product A - Standard', yield: 98.5, volume: 4500, status: 'good' },
  { id: 'PRD-B', name: 'Product B - Premium', yield: 97.8, volume: 2800, status: 'good' },
  { id: 'PRD-C', name: 'Product C - Economy', yield: 96.2, volume: 6200, status: 'warning' },
  { id: 'PRD-D', name: 'Product D - Custom', yield: 99.1, volume: 1200, status: 'good' },
];

interface TraceabilityItem {
  component: string;
  supplier: string;
  batch: string;
  inspected: boolean;
  passed: boolean | null;
  failureReason?: string;
  failureDetails?: {
    defectType: string;
    severity: string;
    inspector: string;
    timestamp: string;
    images?: number;
    correctionAction: string;
  };
}

const traceabilityData: TraceabilityItem[] = [
  {
    component: 'C-445',
    supplier: 'Supplier A',
    batch: 'BA-2847',
    inspected: true,
    passed: true
  },
  {
    component: 'C-446',
    supplier: 'Supplier B',
    batch: 'BB-1923',
    inspected: true,
    passed: true
  },
  {
    component: 'C-447',
    supplier: 'Supplier A',
    batch: 'BA-2848',
    inspected: true,
    passed: false,
    failureReason: 'Dimensional tolerance exceeded',
    failureDetails: {
      defectType: 'Dimensional - Out of Spec',
      severity: 'Critical',
      inspector: 'QA Team 2',
      timestamp: '2026-01-30 14:25:00',
      images: 3,
      correctionAction: 'Batch rejected - Supplier notified for corrective action. Root cause analysis initiated.',
    }
  },
  {
    component: 'C-448',
    supplier: 'Supplier C',
    batch: 'BC-0567',
    inspected: false,
    passed: null
  },
];

export default function ProductDT() {
  const [selectedItem, setSelectedItem] = useState<TraceabilityItem | null>(null);
  const { role } = useRole();
  return (
    <div className="min-h-screen">
      <Header
        title="Product Digital Twin"
        subtitle="Quality monitoring and product traceability"
      />
      <FilterBar showRoleSelector={false} />

      <div className="p-6 space-y-6">
        <AdminVisible id="product.kpis">
        <div className="grid grid-cols-4 gap-4">
          {productKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
        </AdminVisible>

        <div className="grid grid-cols-3 gap-6">
          <AdminVisible id="product.quality-trend">
          <div className="col-span-2 bg-white rounded-xl shadow-card p-5 overflow-hidden">
            <h3 className="font-semibold text-surface-900 mb-4">Quality Trend by Batch</h3>
            <div className="h-72 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrendData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="batch" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#737373" domain={[95, 100]} width={40} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#737373" domain={[0, 5]} width={40} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} name="Yield %">
                    <LabelList dataKey="yield" position="top" fontSize={10} fill="#10b981" offset={8} />
                  </Line>
                  <Line yAxisId="right" type="monotone" dataKey="defects" stroke="#ef4444" strokeWidth={2} name="Defects %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          </AdminVisible>

          <AdminVisible id="product.defect-distribution">          <div className="bg-white rounded-xl shadow-card p-5 overflow-hidden">
            <h3 className="font-semibold text-surface-900 mb-4">Defect Distribution</h3>
            <div className="h-72 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectTypeData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} stroke="#737373" width={75} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" name="Count" radius={[0, 4, 4, 0]}>
                    <LabelList position="right" fontSize={10} fill="#333" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          </AdminVisible>
        </div>

        <AdminVisible id="product.variants-performance">
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Product Variants Performance</h3>
          <div className="grid grid-cols-4 gap-4">
            {productVariants.map((product) => (
              <div
                key={product.id}
                className={`rounded-xl border p-4 ${
                  product.status === 'good' ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-surface-500">{product.id}</span>
                    <h4 className="font-medium text-surface-900 line-clamp-1">{product.name}</h4>
                  </div>
                  {product.status === 'good' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">Yield Rate</span>
                    <span className={`font-medium ${
                      product.yield >= 98 ? 'text-green-600' :
                      product.yield >= 97 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {product.yield}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">Volume</span>
                    <span className="font-medium text-surface-900">{product.volume.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </AdminVisible>

        <AdminVisible id="product.traceability">
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Component Traceability</h3>
            <HelpPopover
              text="Track product components across the supply chain. Click on a product variant to inspect batch quality, defect distribution, and traceability data. Red rows indicate inspection failures — click to view details."
              linkTo="/help"
              linkLabel="Product DT guide"
              position="bottom-left"
            />
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search component..."
                className="pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Component</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Supplier</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Batch</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Inspection</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-surface-600">Details</th>
              </tr>
            </thead>
            <tbody>
              {traceabilityData.map((item) => (
                <tr key={item.component} className="border-b border-surface-100 hover:bg-surface-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-surface-400" />
                      <span className="font-medium text-surface-900">{item.component}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-surface-700">{item.supplier}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm text-surface-600">{item.batch}</span>
                  </td>
                  <td className="py-3 px-4">
                    {item.inspected ? (
                      <span className="badge badge-success">Inspected</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {item.passed === true && <span className="badge badge-success">Passed</span>}
                    {item.passed === false && (
                      <span className="badge badge-critical">Failed</span>
                    )}
                    {item.passed === null && <span className="badge">-</span>}
                  </td>
                  <td className="py-3 px-4">
                    {item.passed === false && item.failureDetails && (
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Info className="w-4 h-4" />
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </AdminVisible>
      </div>

      {selectedItem && selectedItem.failureDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-surface-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-900">Inspection Failure Details</h3>
                  <p className="text-sm text-surface-600">
                    {selectedItem.component} - {selectedItem.batch}
                  </p>
                </div>
              </div>
              <TooltipUI content="Close">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-surface-600" />
                </button>
              </TooltipUI>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                    Failure Reason
                  </label>
                  <p className="text-lg font-medium text-red-600 mt-1">
                    {selectedItem.failureReason}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                      Defect Type
                    </label>
                    <p className="text-sm text-surface-900 mt-1 font-medium">
                      {selectedItem.failureDetails.defectType}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                      Severity
                    </label>
                    <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
                      selectedItem.failureDetails.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      selectedItem.failureDetails.severity === 'Major' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedItem.failureDetails.severity}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                      Inspector
                    </label>
                    <p className="text-sm text-surface-900 mt-1">
                      {selectedItem.failureDetails.inspector}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                      Inspection Time
                    </label>
                    <p className="text-sm text-surface-900 mt-1 font-mono">
                      {selectedItem.failureDetails.timestamp}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                    Supplier Information
                  </label>
                  <div className="mt-2 p-3 bg-surface-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-surface-600">Supplier Name</span>
                      <span className="text-sm font-medium text-surface-900">{selectedItem.supplier}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-surface-600">Batch Number</span>
                      <span className="text-sm font-mono text-surface-900">{selectedItem.batch}</span>
                    </div>
                  </div>
                </div>

                {selectedItem.failureDetails.images && (
                  <div>
                    <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                      Documentation
                    </label>
                    <div className="mt-2 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-900">
                        {selectedItem.failureDetails.images} inspection images available
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-medium text-surface-500 uppercase tracking-wide">
                    Corrective Action
                  </label>
                  <p className="text-sm text-surface-900 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg leading-relaxed">
                    {selectedItem.failureDetails.correctionAction}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-surface-200 bg-surface-50">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
