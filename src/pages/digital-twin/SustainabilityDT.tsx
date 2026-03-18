import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LabelList,
} from 'recharts';
import { Leaf, Zap, Droplets, Wind, Recycle, TrendingDown, Factory, Award, Shield, Users } from 'lucide-react';
import { useRole } from '../../contexts/RoleContext';
import Header from '../../components/layout/Header';
import HelpPopover from '../../components/shared/HelpPopover';
import FilterBar from '../../components/shared/FilterBar';
import KpiCard from '../../components/shared/KpiCard';
import { energyConsumptionData } from '../../data/mockData';
import type { KpiData } from '../../types';

const sustainabilityKpis: KpiData[] = [
  {
    id: 'energy-per-unit',
    label: 'Energy per Unit',
    value: 2.4,
    unit: 'kWh/unit',
    trend: -8.5,
    target: 2.0,
    cluster: 'energy',
    sparklineData: [3.0, 2.9, 2.8, 2.7, 2.6, 2.5, 2.4, 2.4],
  },
  {
    id: 'carbon-footprint',
    label: 'Carbon Footprint',
    value: 145,
    unit: 'kg CO2/unit',
    trend: -12.3,
    target: 120,
    cluster: 'energy',
    sparklineData: [180, 175, 168, 162, 155, 150, 148, 145],
  },
  {
    id: 'water-consumption',
    label: 'Water Consumption',
    value: 18.5,
    unit: 'L/unit',
    trend: -5.2,
    target: 15,
    cluster: 'energy',
    sparklineData: [22, 21, 20, 19.5, 19, 18.8, 18.6, 18.5],
  },
  {
    id: 'recycling-rate',
    label: 'Recycling Rate',
    value: 78.4,
    unit: '%',
    trend: 4.8,
    target: 85,
    cluster: 'energy',
    sparklineData: [68, 70, 72, 74, 75, 76, 77, 78.4],
  },
];

const wasteBreakdownData = [
  { type: 'Metal Scrap', amount: 2450, recycled: 2350 },
  { type: 'Plastic', amount: 1800, recycled: 1400 },
  { type: 'Paper/Cardboard', amount: 1200, recycled: 1150 },
  { type: 'Hazardous', amount: 350, recycled: 280 },
  { type: 'Other', amount: 600, recycled: 420 },
];

const sustainabilityMetrics = [
  { label: 'Renewable Energy', value: 55, unit: '%', icon: Zap, color: 'text-amber-500', trend: '+8%' },
  { label: 'Waste Diverted', value: 78, unit: '%', icon: Recycle, color: 'text-green-500', trend: '+5%' },
  { label: 'Water Recycled', value: 42, unit: '%', icon: Droplets, color: 'text-blue-500', trend: '+12%' },
  { label: 'CO2 Reduction', value: 19, unit: '%', icon: Wind, color: 'text-teal-500', trend: '+3%' },
];

const scorecardRadarData = [
  { dimension: 'Environmental', LCSA: 82, PLCA: 76, HCD: 68, fullMark: 100 },
  { dimension: 'Social', LCSA: 74, PLCA: 65, HCD: 88, fullMark: 100 },
  { dimension: 'Economic', LCSA: 78, PLCA: 72, HCD: 70, fullMark: 100 },
  { dimension: 'Resource Use', LCSA: 85, PLCA: 80, HCD: 62, fullMark: 100 },
  { dimension: 'Circularity', LCSA: 70, PLCA: 74, HCD: 65, fullMark: 100 },
  { dimension: 'Human Impact', LCSA: 68, PLCA: 60, HCD: 92, fullMark: 100 },
];

const scorecardDimensions = [
  {
    key: 'LCSA',
    label: 'LCSA',
    fullLabel: 'Life Cycle Sustainability Assessment',
    score: 76,
    color: '#0066b3',
    icon: Leaf,
    details: [
      { label: 'Environmental LCA', value: 82 },
      { label: 'Social LCA', value: 74 },
      { label: 'Life Cycle Costing', value: 72 },
    ],
  },
  {
    key: 'PLCA',
    label: 'PLCA',
    fullLabel: 'Product Life Cycle Assessment',
    score: 71,
    color: '#2a9d8f',
    icon: Shield,
    details: [
      { label: 'Raw Materials', value: 76 },
      { label: 'Manufacturing', value: 80 },
      { label: 'End-of-Life', value: 58 },
    ],
  },
  {
    key: 'HCD',
    label: 'HCD',
    fullLabel: 'Human-Centred Design',
    score: 74,
    color: '#e76f51',
    icon: Users,
    details: [
      { label: 'Usability', value: 88 },
      { label: 'Accessibility', value: 72 },
      { label: 'Worker Safety', value: 62 },
    ],
  },
];

const overallSustainabilityScore = 74;

const sankeyFlowData = {
  stages: [
    { id: 'raw', label: 'Raw Materials', x: 40, y: 140, width: 120, height: 180, color: '#64748b' },
    { id: 'prod', label: 'Production', x: 260, y: 120, width: 120, height: 220, color: '#0066b3' },
    { id: 'assembly', label: 'Assembly', x: 480, y: 140, width: 120, height: 180, color: '#2a9d8f' },
    { id: 'dist', label: 'Distribution', x: 700, y: 160, width: 120, height: 140, color: '#f59e0b' },
  ],
  flows: [
    { from: 'raw', to: 'prod', value: 4200, label: 'Steel & Metals', yFrom: 170, yTo: 155, color: '#94a3b8' },
    { from: 'raw', to: 'prod', value: 2800, label: 'Polymers', yFrom: 220, yTo: 210, color: '#94a3b8' },
    { from: 'raw', to: 'prod', value: 1600, label: 'Electronics', yFrom: 270, yTo: 265, color: '#94a3b8' },
    { from: 'prod', to: 'assembly', value: 3800, label: 'Components', yFrom: 170, yTo: 175, color: '#60a5fa' },
    { from: 'prod', to: 'assembly', value: 2600, label: 'Sub-assemblies', yFrom: 230, yTo: 235, color: '#60a5fa' },
    { from: 'prod', to: 'assembly', value: 850, label: 'Energy (MWh)', yFrom: 290, yTo: 280, color: '#fbbf24' },
    { from: 'assembly', to: 'dist', value: 5200, label: 'Finished Units', yFrom: 195, yTo: 200, color: '#34d399' },
    { from: 'assembly', to: 'dist', value: 1100, label: 'Packaging', yFrom: 260, yTo: 255, color: '#34d399' },
  ],
};

const heatmapData = {
  lines: ['Line A', 'Line B', 'Line C', 'Line D', 'Line E'],
  periods: ['Q1-W1', 'Q1-W2', 'Q1-W3', 'Q1-W4', 'Q2-W1', 'Q2-W2', 'Q2-W3', 'Q2-W4', 'Q3-W1', 'Q3-W2', 'Q3-W3', 'Q3-W4'],
  values: [
    [32, 38, 45, 42, 50, 55, 48, 44, 40, 36, 34, 30],
    [28, 30, 35, 40, 44, 48, 52, 50, 46, 42, 38, 35],
    [55, 60, 58, 52, 48, 45, 42, 40, 38, 42, 45, 48],
    [22, 25, 28, 32, 35, 38, 40, 42, 44, 40, 36, 32],
    [45, 48, 52, 56, 60, 62, 58, 54, 50, 46, 44, 42],
  ],
};

function getHeatmapColor(value: number): string {
  if (value <= 25) return '#dcfce7';
  if (value <= 35) return '#86efac';
  if (value <= 45) return '#fde68a';
  if (value <= 55) return '#fdba74';
  return '#fca5a5';
}

function GaugeChart({ score, size = 200 }: { score: number; size?: number }) {
  const centerX = size / 2;
  const centerY = size / 2 + 10;
  const radius = size / 2 - 20;
  const startAngle = Math.PI;
  const endAngle = 0;
  const scoreAngle = startAngle - (score / 100) * Math.PI;

  const arcPath = (start: number, end: number, r: number) => {
    const x1 = centerX + r * Math.cos(start);
    const y1 = centerY - r * Math.sin(start);
    const x2 = centerX + r * Math.cos(end);
    const y2 = centerY - r * Math.sin(end);
    const largeArc = start - end > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const needleX = centerX + (radius - 15) * Math.cos(scoreAngle);
  const needleY = centerY - (radius - 15) * Math.sin(scoreAngle);

  let gaugeColor = '#ef4444';
  if (score >= 80) gaugeColor = '#10b981';
  else if (score >= 60) gaugeColor = '#f59e0b';
  else if (score >= 40) gaugeColor = '#f97316';

  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 40}`}>
      <path
        d={arcPath(startAngle, endAngle, radius)}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={16}
        strokeLinecap="round"
      />
      <path
        d={arcPath(startAngle, scoreAngle, radius)}
        fill="none"
        stroke={gaugeColor}
        strokeWidth={16}
        strokeLinecap="round"
      />
      <line
        x1={centerX}
        y1={centerY}
        x2={needleX}
        y2={needleY}
        stroke="#374151"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={centerX} cy={centerY} r={5} fill="#374151" />
      <text x={centerX} y={centerY + 24} textAnchor="middle" className="text-2xl font-bold" fill="#111827" fontSize={28}>
        {score}
      </text>
      <text x={centerX} y={centerY + 40} textAnchor="middle" fill="#6b7280" fontSize={11}>
        out of 100
      </text>
      <text x={centerX - radius + 5} y={centerY + 16} textAnchor="start" fill="#9ca3af" fontSize={10}>0</text>
      <text x={centerX + radius - 5} y={centerY + 16} textAnchor="end" fill="#9ca3af" fontSize={10}>100</text>
      <text x={centerX} y={centerY - radius + 2} textAnchor="middle" fill="#9ca3af" fontSize={10}>50</text>
    </svg>
  );
}

function SankeyFlowDiagram() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 860 380" preserveAspectRatio="xMidYMid meet">
      <defs>
        {sankeyFlowData.flows.map((flow, i) => (
          <linearGradient key={`grad-${i}`} id={`flow-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={flow.color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={flow.color} stopOpacity={0.3} />
          </linearGradient>
        ))}
      </defs>

      {sankeyFlowData.stages.map((stage) => (
        <g key={stage.id}>
          <rect
            x={stage.x}
            y={stage.y}
            width={stage.width}
            height={stage.height}
            rx={8}
            fill={stage.color}
            opacity={0.15}
            stroke={stage.color}
            strokeWidth={2}
          />
          <text
            x={stage.x + stage.width / 2}
            y={stage.y - 8}
            textAnchor="middle"
            fill="#374151"
            fontSize={13}
            fontWeight={600}
          >
            {stage.label}
          </text>
        </g>
      ))}

      {sankeyFlowData.flows.map((flow, i) => {
        const fromStage = sankeyFlowData.stages.find((s) => s.id === flow.from)!;
        const toStage = sankeyFlowData.stages.find((s) => s.id === flow.to)!;
        const x1 = fromStage.x + fromStage.width;
        const x2 = toStage.x;
        const thickness = Math.max(4, Math.min(28, flow.value / 200));
        const cpx1 = x1 + (x2 - x1) * 0.4;
        const cpx2 = x1 + (x2 - x1) * 0.6;

        return (
          <g key={`flow-${i}`}>
            <path
              d={`M ${x1} ${flow.yFrom} C ${cpx1} ${flow.yFrom}, ${cpx2} ${flow.yTo}, ${x2} ${flow.yTo}`}
              fill="none"
              stroke={`url(#flow-grad-${i})`}
              strokeWidth={thickness}
              strokeLinecap="round"
            />
            <text
              x={(x1 + x2) / 2}
              y={((flow.yFrom + flow.yTo) / 2) - thickness / 2 - 4}
              textAnchor="middle"
              fill="#6b7280"
              fontSize={9}
              fontWeight={500}
            >
              {flow.label}
            </text>
            <text
              x={(x1 + x2) / 2}
              y={((flow.yFrom + flow.yTo) / 2) + thickness / 2 + 11}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize={8}
            >
              {flow.value.toLocaleString()} {flow.label === 'Energy (MWh)' ? 'MWh' : 'kg'}
            </text>
          </g>
        );
      })}

      <text x={430} y={370} textAnchor="middle" fill="#9ca3af" fontSize={10}>
        Material & Energy Flow Across Value Chain Stages
      </text>
    </svg>
  );
}

function EnvironmentalHeatmap() {
  const cellWidth = 56;
  const cellHeight = 36;
  const labelWidth = 60;
  const headerHeight = 48;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: heatmapData.periods.length * cellWidth + labelWidth + 20 }}>
        <div className="flex">
          <div style={{ width: labelWidth }} className="shrink-0" />
          {heatmapData.periods.map((period) => (
            <div
              key={period}
              className="text-xs text-surface-500 font-medium text-center shrink-0"
              style={{ width: cellWidth, height: headerHeight, display: 'flex', alignItems: 'end', justifyContent: 'center', paddingBottom: 4 }}
            >
              <span className="-rotate-45 inline-block origin-center whitespace-nowrap">{period}</span>
            </div>
          ))}
        </div>
        {heatmapData.lines.map((line, rowIdx) => (
          <div key={line} className="flex items-center">
            <div
              style={{ width: labelWidth }}
              className="text-xs font-medium text-surface-700 shrink-0 pr-2 text-right"
            >
              {line}
            </div>
            {heatmapData.values[rowIdx].map((val, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className="shrink-0 flex items-center justify-center border border-white rounded"
                style={{
                  width: cellWidth,
                  height: cellHeight,
                  backgroundColor: getHeatmapColor(val),
                }}
                title={`${line} / ${heatmapData.periods[colIdx]}: ${val} kg CO2e`}
              >
                <span className="text-xs font-medium text-surface-700">{val}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-4 ml-16">
          <span className="text-xs text-surface-500">Impact (kg CO2e):</span>
          <div className="flex items-center gap-1">
            {[
              { color: '#dcfce7', label: '0-25' },
              { color: '#86efac', label: '26-35' },
              { color: '#fde68a', label: '36-45' },
              { color: '#fdba74', label: '46-55' },
              { color: '#fca5a5', label: '56+' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <div className="w-4 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-surface-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SustainabilityDT() {
  const { role } = useRole();
  const isManager = role === 'manager';
  const isEngineer = role === 'engineer';
  const showDetailedCharts = role !== 'manager';

  return (
    <div className="min-h-screen">
      <Header
        title="Sustainability Digital Twin"
        subtitle="Environmental impact monitoring and optimization"
      />
      <FilterBar showRoleSelector={false} />

      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900">Sustainability Scorecard</h2>
              <p className="text-sm text-surface-500">Fused assessment across LCSA, PLCA, and HCD dimensions</p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-4 flex flex-col items-center justify-center border border-surface-200 rounded-xl p-4 bg-surface-50">
              <span className="text-sm font-semibold text-surface-700 mb-2">Overall Sustainability Score</span>
              <GaugeChart score={overallSustainabilityScore} size={220} />
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-surface-500">Rating: Good - Room for improvement</span>
              </div>
            </div>

            <div className="col-span-4">
              <div className="h-full flex flex-col">
                <span className="text-sm font-semibold text-surface-700 mb-2 text-center">Dimension Radar</span>
                <div className="flex-1 min-h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={scorecardRadarData} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: '#6b7280' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar name="LCSA" dataKey="LCSA" stroke="#0066b3" fill="#0066b3" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="PLCA" dataKey="PLCA" stroke="#2a9d8f" fill="#2a9d8f" fillOpacity={0.15} strokeWidth={2} />
                      <Radar name="HCD" dataKey="HCD" stroke="#e76f51" fill="#e76f51" fillOpacity={0.15} strokeWidth={2} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-span-4 space-y-4">
              {scorecardDimensions.map((dim) => (
                <div key={dim.key} className="border border-surface-200 rounded-xl p-4 bg-surface-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${dim.color}15` }}>
                      <dim.icon className="w-4 h-4" style={{ color: dim.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-surface-900">{dim.label}</span>
                        <span className="text-lg font-bold" style={{ color: dim.color }}>{dim.score}</span>
                      </div>
                      <span className="text-xs text-surface-500">{dim.fullLabel}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${dim.score}%`, backgroundColor: dim.color }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    {dim.details.map((detail) => (
                      <div key={detail.label} className="flex items-center justify-between">
                        <span className="text-xs text-surface-600">{detail.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-surface-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${detail.value}%`, backgroundColor: dim.color, opacity: 0.7 }}
                            />
                          </div>
                          <span className="text-xs font-medium text-surface-700 w-6 text-right">{detail.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {sustainabilityKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {sustainabilityMetrics.map((metric) => (
            <div key={metric.label} className="bg-white rounded-xl shadow-card p-4">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {metric.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-surface-900">
                {metric.value}{metric.unit}
              </div>
              <div className="text-sm text-surface-500 mt-1">{metric.label}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Factory className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">Material & Energy Flow Analysis</h3>
              <p className="text-xs text-surface-500">Sankey-style visualization of resource flows across production stages</p>
            </div>
          </div>
          <div className="h-96">
            <SankeyFlowDiagram />
          </div>
        </div>

        {showDetailedCharts && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-surface-900">Environmental Impact Heatmap</h3>
                <HelpPopover
                  text="Track environmental metrics including carbon footprint, energy consumption, water usage, and waste recycling rates. The heatmap shows CO2 emissions per production line over time. Green initiatives and ESG compliance scores are also displayed."
                  linkTo="/help"
                  linkLabel="Sustainability guide"
                  position="bottom-right"
                />
              </div>
              <p className="text-xs text-surface-500">CO2 equivalent emissions by production line and time period</p>
            </div>
          </div>
          <EnvironmentalHeatmap />
        </div>
        )}

        {showDetailedCharts && (
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-surface-900 mb-4">Energy Consumption by Line</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyConsumptionData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737373" width={40} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="line1" stackId="1" stroke="#0066b3" fill="#0066b3" fillOpacity={0.6} name="Line 1" />
                  <Area type="monotone" dataKey="line2" stackId="1" stroke="#2a9d8f" fill="#2a9d8f" fillOpacity={0.6} name="Line 2" />
                  <Area type="monotone" dataKey="line3" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Line 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        )}

        {showDetailedCharts && (
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Waste Management</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteBreakdownData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#737373" />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} stroke="#737373" width={90} />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#94a3b8" name="Total (kg)" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="amount" position="right" fontSize={10} fill="#555" />
                </Bar>
                <Bar dataKey="recycled" fill="#10b981" name="Recycled (kg)" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="recycled" position="right" fontSize={10} fill="#555" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Sustainability Goals Progress</h3>
            <span className="text-sm text-surface-500">Target Year: 2030</span>
          </div>
          <div className="space-y-4">
            {[
              { goal: 'Carbon Neutral Production', current: 45, target: 100 },
              { goal: '100% Renewable Energy', current: 55, target: 100 },
              { goal: 'Zero Waste to Landfill', current: 78, target: 100 },
              { goal: 'Water Recycling Target', current: 42, target: 80 },
            ].map((item) => (
              <div key={item.goal}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-surface-700">{item.goal}</span>
                  <span className="text-surface-500">{item.current}% / {item.target}%</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.current / item.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {isManager && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Strategic View:</span> Detailed environmental charts are available in the Engineer view. This view focuses on sustainability scorecard and goal progress.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
