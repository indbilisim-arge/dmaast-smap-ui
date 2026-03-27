import { useState } from 'react';
import { useRole } from '../../contexts/RoleContext';
import AdminVisible from '../../components/shared/AdminVisible';
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
  RadialBarChart,
  RadialBar,
  LabelList,
} from 'recharts';
import { Cpu, Activity, Thermometer, Zap, FlaskConical, ChevronDown, ChevronUp, RotateCcw, Play, X, CheckCircle } from 'lucide-react';
import Header from '../../components/layout/Header';
import HelpPopover from '../../components/shared/HelpPopover';
import FilterBar from '../../components/shared/FilterBar';
import KpiCard from '../../components/shared/KpiCard';
import ExportPanel from '../../components/shared/ExportPanel';
import { default as TooltipUI } from '../../components/shared/Tooltip';
import { dashboardKpis, productionTrendData } from '../../data/mockData';

const oeeBreakdown = [
  { name: 'Availability', value: 95.2, fill: '#0066b3' },
  { name: 'Performance', value: 92.5, fill: '#2a9d8f' },
  { name: 'Quality', value: 99.1, fill: '#10b981' },
];

const machineData = [
  { id: 'M-101', name: 'CNC Mill 1', status: 'running', oee: 92, temp: 68, power: 45 },
  { id: 'M-102', name: 'CNC Mill 2', status: 'warning', oee: 78, temp: 85, power: 52 },
  { id: 'M-103', name: 'Assembly Robot', status: 'running', oee: 95, temp: 42, power: 38 },
  { id: 'M-104', name: 'Press Machine', status: 'running', oee: 88, temp: 55, power: 65 },
  { id: 'M-105', name: 'Inspection Unit', status: 'idle', oee: 0, temp: 25, power: 5 },
  { id: 'M-106', name: 'Packaging Line', status: 'running', oee: 91, temp: 35, power: 28 },
];

const cycleTimeData = [
  { station: 'Station 1', actual: 42, target: 45 },
  { station: 'Station 2', actual: 38, target: 40 },
  { station: 'Station 3', actual: 55, target: 50 },
  { station: 'Station 4', actual: 32, target: 35 },
  { station: 'Station 5', actual: 48, target: 45 },
];

function MachineCard({ machine }: { machine: typeof machineData[0] }) {
  const statusConfig = {
    running: { bg: 'bg-green-500', text: 'Running', textColor: 'text-green-700', bgLight: 'bg-green-50' },
    warning: { bg: 'bg-amber-500', text: 'Warning', textColor: 'text-amber-700', bgLight: 'bg-amber-50' },
    idle: { bg: 'bg-surface-400', text: 'Idle', textColor: 'text-surface-600', bgLight: 'bg-surface-50' },
    stopped: { bg: 'bg-red-500', text: 'Stopped', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  };

  const config = statusConfig[machine.status as keyof typeof statusConfig];

  return (
    <div className={`rounded-xl border border-surface-200 p-4 ${config.bgLight}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${config.bg}`} />
            <span className={`text-xs font-medium ${config.textColor}`}>{config.text}</span>
          </div>
          <h4 className="font-medium text-surface-900">{machine.name}</h4>
          <span className="text-xs text-surface-500">{machine.id}</span>
        </div>
        <TooltipUI content="Machine details">
          <Cpu className="w-5 h-5 text-surface-400" />
        </TooltipUI>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TooltipUI content="Overall Equipment Effectiveness">
              <Activity className="w-4 h-4 text-surface-400" />
            </TooltipUI>
            <span className="text-xs text-surface-600">OEE</span>
          </div>
          <span className="text-sm font-medium text-surface-900">{machine.oee}%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TooltipUI content="Operating temperature">
              <Thermometer className="w-4 h-4 text-surface-400" />
            </TooltipUI>
            <span className="text-xs text-surface-600">Temp</span>
          </div>
          <span className={`text-sm font-medium ${machine.temp > 80 ? 'text-red-600' : 'text-surface-900'}`}>
            {machine.temp}°C
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TooltipUI content="Power consumption">
              <Zap className="w-4 h-4 text-surface-400" />
            </TooltipUI>
            <span className="text-xs text-surface-600">Power</span>
          </div>
          <span className="text-sm font-medium text-surface-900">{machine.power} kW</span>
        </div>
      </div>
    </div>
  );
}

// ─── What-if scenario types ──────────────────────────────────────────────────
type WhatIfEvent =
  | 'machine-offline'
  | 'capacity-reduction'
  | 'maintenance-window'
  | 'demand-spike'
  | 'supply-disruption';

interface WhatIfForm {
  event: WhatIfEvent;
  targetMachine: string;
  capacityPct: number;
  durationHours: number;
  demandMultiplier: number;
  notes: string;
}

interface WhatIfResult {
  oeeImpact: number;
  throughputImpact: number;
  energyImpact: number;
  onTimeRisk: string;
  recommendation: string;
}

const EVENT_LABELS: Record<WhatIfEvent, string> = {
  'machine-offline': 'Machine Offline',
  'capacity-reduction': 'Capacity Reduction',
  'maintenance-window': 'Planned Maintenance',
  'demand-spike': 'Demand Spike',
  'supply-disruption': 'Supply Disruption',
};

const DEFAULT_FORM: WhatIfForm = {
  event: 'machine-offline',
  targetMachine: 'M-101',
  capacityPct: 100,
  durationHours: 4,
  demandMultiplier: 100,
  notes: '',
};

function computeWhatIfResult(form: WhatIfForm): WhatIfResult {
  const cap = form.capacityPct / 100;
  const dur = form.durationHours;
  const demand = form.demandMultiplier / 100;

  let oeeImpact = 0;
  let throughputImpact = 0;
  let energyImpact = 0;
  let onTimeRisk = 'Low';
  let recommendation = '';

  switch (form.event) {
    case 'machine-offline':
      oeeImpact = -(dur * 1.8);
      throughputImpact = -(dur * 2.5);
      energyImpact = -(dur * 0.8);
      onTimeRisk = dur >= 6 ? 'High' : dur >= 3 ? 'Medium' : 'Low';
      recommendation = `Reroute jobs from ${form.targetMachine} to available machines. Consider overtime for ${Math.ceil(dur / 2)} hours.`;
      break;
    case 'capacity-reduction':
      oeeImpact = -((1 - cap) * 30);
      throughputImpact = -((1 - cap) * 40);
      energyImpact = -((1 - cap) * 15);
      onTimeRisk = cap < 0.6 ? 'High' : cap < 0.8 ? 'Medium' : 'Low';
      recommendation = `At ${form.capacityPct}% capacity, prioritize high-value orders and defer non-critical batches.`;
      break;
    case 'maintenance-window':
      oeeImpact = -(dur * 1.2);
      throughputImpact = -(dur * 1.8);
      energyImpact = dur * 0.3;
      onTimeRisk = dur >= 8 ? 'Medium' : 'Low';
      recommendation = `Schedule maintenance during off-peak shift. Pre-stage materials for fast restart.`;
      break;
    case 'demand-spike':
      oeeImpact = demand > 1.2 ? -(demand - 1) * 10 : 0;
      throughputImpact = (demand - 1) * 30;
      energyImpact = (demand - 1) * 20;
      onTimeRisk = demand > 1.3 ? 'High' : demand > 1.1 ? 'Medium' : 'Low';
      recommendation = `+${Math.round((demand - 1) * 100)}% demand surge detected. Activate standby machines and extend shift hours.`;
      break;
    case 'supply-disruption':
      throughputImpact = -(dur * 3);
      oeeImpact = -(dur * 1.5);
      energyImpact = -(dur * 1);
      onTimeRisk = dur >= 4 ? 'High' : 'Medium';
      recommendation = `Activate safety stock protocol. Contact alternative suppliers for ${form.targetMachine} dependencies.`;
      break;
  }

  return {
    oeeImpact: Math.max(-30, Math.round(oeeImpact * 10) / 10),
    throughputImpact: Math.round(throughputImpact * 10) / 10,
    energyImpact: Math.round(energyImpact * 10) / 10,
    onTimeRisk,
    recommendation,
  };
}

function WhatIfPanel() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<WhatIfForm>(DEFAULT_FORM);
  const [result, setResult] = useState<WhatIfResult | null>(null);
  const [ran, setRan] = useState(false);

  const update = <K extends keyof WhatIfForm>(key: K, value: WhatIfForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setResult(null);
    setRan(false);
  };

  const handleRun = () => {
    setResult(computeWhatIfResult(form));
    setRan(true);
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult(null);
    setRan(false);
  };

  const riskColor = (risk: string) =>
    risk === 'High' ? 'text-red-600 bg-red-50 border-red-200'
    : risk === 'Medium' ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-green-600 bg-green-50 border-green-200';

  const impactColor = (val: number) => val >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg">
            <FlaskConical className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900">CDT What-if Scenario</h3>
              <HelpPopover
                text="Define hypothetical disruptive events (e.g., 'If Machine X goes offline for 6 hours') to forecast their impact on OEE, throughput, and energy. The system generates recommendations for mitigation."
                linkTo="/help"
                linkLabel="What-if tutorial"
                position="bottom-right"
              />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">
              Model disruptive events and forecast KPI impact before they occur
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-surface-400" /> : <ChevronDown className="w-4 h-4 text-surface-400" />}
      </button>

      {open && (
        <div className="border-t border-surface-100 p-5 space-y-5">

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Event type */}
            <div>
              <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
                Disruptive Event
              </label>
              <select
                value={form.event}
                onChange={e => update('event', e.target.value as WhatIfEvent)}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {(Object.keys(EVENT_LABELS) as WhatIfEvent[]).map(k => (
                  <option key={k} value={k}>{EVENT_LABELS[k]}</option>
                ))}
              </select>
            </div>

            {/* Target machine */}
            <div>
              <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
                Target Machine
              </label>
              <select
                value={form.targetMachine}
                onChange={e => update('targetMachine', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {machineData.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
                Duration: <span className="text-violet-600 normal-case font-bold">{form.durationHours} hrs</span>
              </label>
              <input
                type="range"
                min={1} max={24} step={1}
                value={form.durationHours}
                onChange={e => update('durationHours', Number(e.target.value))}
                className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between text-xs text-surface-400 mt-0.5">
                <span>1h</span><span>12h</span><span>24h</span>
              </div>
            </div>

            {/* Capacity */}
            {(form.event === 'capacity-reduction' || form.event === 'machine-offline') && (
              <div>
                <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
                  Available Capacity: <span className="text-violet-600 font-bold">{form.capacityPct}%</span>
                </label>
                <input
                  type="range"
                  min={10} max={100} step={5}
                  value={form.capacityPct}
                  onChange={e => update('capacityPct', Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-surface-400 mt-0.5">
                  <span>10%</span><span>55%</span><span>100%</span>
                </div>
              </div>
            )}

            {/* Demand multiplier */}
            {form.event === 'demand-spike' && (
              <div>
                <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
                  Demand Level: <span className="text-violet-600 font-bold">{form.demandMultiplier}%</span>
                </label>
                <input
                  type="range"
                  min={100} max={200} step={5}
                  value={form.demandMultiplier}
                  onChange={e => update('demandMultiplier', Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-xs text-surface-400 mt-0.5">
                  <span>100%</span><span>150%</span><span>200%</span>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-surface-600 uppercase tracking-wide mb-1.5">
                Notes (optional)
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                placeholder={`e.g., "If ${machineData.find(m => m.id === form.targetMachine)?.name} goes offline due to bearing failure..."`}
                className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRun}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Simulation
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg border border-amber-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Results */}
          {ran && result && (
            <div className="border border-violet-200 rounded-xl bg-violet-50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-violet-900">
                  Forecast Impact — {EVENT_LABELS[form.event]}
                  {form.event !== 'demand-spike' && <span className="font-normal text-violet-700"> on {machineData.find(m => m.id === form.targetMachine)?.name}</span>}
                </h4>
                <button onClick={() => setRan(false)} className="text-violet-400 hover:text-violet-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* KPI impact grid */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'OEE Impact', value: result.oeeImpact, unit: '%' },
                  { label: 'Throughput Impact', value: result.throughputImpact, unit: ' units/day' },
                  { label: 'Energy Impact', value: result.energyImpact, unit: ' kWh' },
                ].map(item => (
                  <div key={item.label} className="bg-white rounded-lg p-3 border border-violet-100">
                    <p className="text-xs text-surface-500 mb-1">{item.label}</p>
                    <p className={`text-xl font-bold ${impactColor(item.value)}`}>
                      {item.value >= 0 ? '+' : ''}{item.value}{item.unit}
                    </p>
                  </div>
                ))}
              </div>

              {/* On-time risk */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-surface-600">On-Time Delivery Risk:</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${riskColor(result.onTimeRisk)}`}>
                  {result.onTimeRisk}
                </span>
              </div>

              {/* Recommendation */}
              <div className="bg-white rounded-lg border border-violet-100 p-3 flex gap-2">
                <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-surface-700">{result.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ManufacturingDT() {
  const { role } = useRole();
  const manufacturingKpis = dashboardKpis.filter(kpi =>
    ['equipment-availability', 'production-throughput', 'oee', 'yield-rate'].includes(kpi.id)
  );

  return (
    <div className="min-h-screen">
      <Header
        title="Manufacturing Digital Twin"
        subtitle="Real-time production monitoring and equipment status"
      />
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-surface-200">
        <FilterBar showRoleSelector={false} showAutoRefresh={true} />
        <ExportPanel
          reportTitle="Manufacturing Digital Twin Analysis Report"
          onExport={(format, sections) => console.log('Exporting:', format, sections)}
        />
      </div>

      <div className="p-6 space-y-6" id="printable-content">
        <AdminVisible id="manufacturing.kpis">
        <div className="grid grid-cols-4 gap-4">
          {manufacturingKpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
        </AdminVisible>


        <div className="grid grid-cols-3 gap-6">
          <AdminVisible id="manufacturing.oee-breakdown">
          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-surface-900 mb-4">OEE Breakdown</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  data={oeeBreakdown}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={5}
                    background={{ fill: '#f5f5f5' }}
                  >
                    <LabelList dataKey="value" position="end" fontSize={11} fill="#333" formatter={(v: any) => `${v}%`} />
                  </RadialBar>
                  <Tooltip />
                  <Legend
                    iconSize={10}
                    layout="horizontal"
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
              <span className="text-3xl font-bold text-primary-600">87.5%</span>
              <span className="text-sm text-surface-500 ml-2">Overall OEE</span>
            </div>
          </div>
          </AdminVisible>

          <AdminVisible id="manufacturing.production-output">
          <div className="col-span-2 bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-surface-900 mb-4">Production Output</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737373" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#0066b3" strokeWidth={2} name="Actual">
                  <LabelList dataKey="actual" position="top" fontSize={10} fill="#0066b3" offset={8} />
                </Line>
                  <Line type="monotone" dataKey="target" stroke="#d4d4d4" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          </AdminVisible>
        </div>

        <AdminVisible id="manufacturing.machine-status">
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-surface-900">Machine Status</h3>
              <HelpPopover
                text="Machine status indicators show real-time equipment state. Green (Running) means normal operation, Amber (Warning) signals performance degradation or threshold alerts, Grey (Idle) indicates the machine is powered on but not producing, and Red (Stopped) means the machine is offline or faulted."
                linkTo="/help"
                position="bottom-right"
              />
            </div>
            <div className="flex items-center gap-4 text-sm">
              <TooltipUI content="Machines operating normally">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-surface-600">Running (4)</span>
                </div>
              </TooltipUI>
              <TooltipUI content="Machines requiring attention">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-surface-600">Warning (1)</span>
                </div>
              </TooltipUI>
              <TooltipUI content="Machines not in use">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-surface-400" />
                  <span className="text-surface-600">Idle (1)</span>
                </div>
              </TooltipUI>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {machineData.map((machine) => (
              <MachineCard key={machine.id} machine={machine} />
            ))}
          </div>
        </div>
        </AdminVisible>

        <AdminVisible id="manufacturing.what-if">
        <WhatIfPanel />
        </AdminVisible>

        <AdminVisible id="manufacturing.cycle-time">
        <div className="bg-white rounded-xl shadow-card p-5">
          <h3 className="font-semibold text-surface-900 mb-4">Cycle Time Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycleTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="station" tick={{ fontSize: 12 }} stroke="#737373" />
                <YAxis tick={{ fontSize: 12 }} stroke="#737373" />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" fill="#0066b3" name="Actual (sec)" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="actual" position="top" fontSize={10} fill="#333" />
              </Bar>
                <Bar dataKey="target" fill="#d4d4d4" name="Target (sec)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        </AdminVisible>
      </div>
    </div>
  );
}
