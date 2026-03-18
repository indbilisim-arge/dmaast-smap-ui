import { useState } from 'react';
import { CheckCircle, RefreshCw, Clock, Zap, TrendingUp, ArrowUpRight, ArrowDownRight, BarChart3, ChevronDown } from 'lucide-react';
import Header from '../../components/layout/Header';
import HelpPopover from '../../components/shared/HelpPopover';

interface KpiImpact {
  label: string;
  value: string;
  positive: boolean;
}

interface ScheduleScenario {
  id: string;
  name: string;
  description: string;
  kpis: KpiImpact[];
}

interface GanttJob {
  machine: string;
  jobs: { name: string; start: number; duration: number; color: string }[];
}

const PROCESSES = ['Assembly Line', 'Packaging', 'Quality Control'];

const SCENARIOS: ScheduleScenario[] = [
  {
    id: 'optimized-throughput',
    name: 'Optimized Throughput',
    description:
      'Maximizes production output by minimizing idle time and sequencing jobs to reduce changeover delays across all machines.',
    kpis: [
      { label: 'Throughput', value: '+12%', positive: true },
      { label: 'Energy', value: '-5%', positive: true },
      { label: 'OEE', value: '+8%', positive: true },
    ],
  },
  {
    id: 'balanced-load',
    name: 'Balanced Load',
    description:
      'Distributes workload evenly across machines to reduce peak energy consumption and extend equipment life while maintaining steady output.',
    kpis: [
      { label: 'Throughput', value: '+5%', positive: true },
      { label: 'Energy', value: '-15%', positive: true },
      { label: 'OEE', value: '+12%', positive: true },
    ],
  },
  {
    id: 'priority-rush',
    name: 'Priority Rush',
    description:
      'Prioritizes urgent orders by front-loading high-priority jobs, accepting higher energy usage and potential minor OEE trade-offs.',
    kpis: [
      { label: 'Throughput', value: '+25%', positive: true },
      { label: 'Energy', value: '+10%', positive: false },
      { label: 'OEE', value: '-3%', positive: false },
    ],
  },
];

const CURRENT_GANTT: GanttJob[] = [
  {
    machine: 'Machine A',
    jobs: [
      { name: 'Job 1', start: 0, duration: 2, color: 'bg-blue-400' },
      { name: 'Idle', start: 2, duration: 1, color: 'bg-surface-200' },
      { name: 'Job 4', start: 3, duration: 2.5, color: 'bg-teal-400' },
      { name: 'Idle', start: 5.5, duration: 0.5, color: 'bg-surface-200' },
      { name: 'Job 7', start: 6, duration: 2, color: 'bg-amber-400' },
    ],
  },
  {
    machine: 'Machine B',
    jobs: [
      { name: 'Idle', start: 0, duration: 0.5, color: 'bg-surface-200' },
      { name: 'Job 2', start: 0.5, duration: 3, color: 'bg-green-400' },
      { name: 'Job 5', start: 3.5, duration: 2, color: 'bg-rose-400' },
      { name: 'Idle', start: 5.5, duration: 1, color: 'bg-surface-200' },
      { name: 'Job 8', start: 6.5, duration: 1.5, color: 'bg-cyan-400' },
    ],
  },
  {
    machine: 'Machine C',
    jobs: [
      { name: 'Job 3', start: 0, duration: 1.5, color: 'bg-orange-400' },
      { name: 'Idle', start: 1.5, duration: 1.5, color: 'bg-surface-200' },
      { name: 'Job 6', start: 3, duration: 3, color: 'bg-sky-400' },
      { name: 'Idle', start: 6, duration: 0.5, color: 'bg-surface-200' },
      { name: 'Job 9', start: 6.5, duration: 1.5, color: 'bg-red-400' },
    ],
  },
];

const PROPOSED_GANTT: GanttJob[] = [
  {
    machine: 'Machine A',
    jobs: [
      { name: 'Job 1', start: 0, duration: 2, color: 'bg-blue-400' },
      { name: 'Job 4', start: 2, duration: 2.5, color: 'bg-teal-400' },
      { name: 'Job 7', start: 4.5, duration: 2, color: 'bg-amber-400' },
      { name: 'Job 9', start: 6.5, duration: 1.5, color: 'bg-red-400' },
    ],
  },
  {
    machine: 'Machine B',
    jobs: [
      { name: 'Job 2', start: 0, duration: 3, color: 'bg-green-400' },
      { name: 'Job 5', start: 3, duration: 2, color: 'bg-rose-400' },
      { name: 'Job 8', start: 5, duration: 1.5, color: 'bg-cyan-400' },
      { name: 'Idle', start: 6.5, duration: 1.5, color: 'bg-surface-200' },
    ],
  },
  {
    machine: 'Machine C',
    jobs: [
      { name: 'Job 3', start: 0, duration: 1.5, color: 'bg-orange-400' },
      { name: 'Job 6', start: 1.5, duration: 3, color: 'bg-sky-400' },
      { name: 'Idle', start: 4.5, duration: 3.5, color: 'bg-surface-200' },
    ],
  },
];

const COMPARISON_METRICS = [
  { label: 'Total Makespan', current: '8.0 hrs', proposed: '6.5 hrs', change: '-18.8%', positive: true },
  { label: 'Avg. Machine Utilization', current: '72%', proposed: '89%', change: '+17%', positive: true },
  { label: 'Total Idle Time', current: '4.5 hrs', proposed: '1.5 hrs', change: '-66.7%', positive: true },
  { label: 'Energy Consumption', current: '340 kWh', proposed: '322 kWh', change: '-5.3%', positive: true },
  { label: 'On-Time Delivery Risk', current: '3 jobs', proposed: '0 jobs', change: '-100%', positive: true },
  { label: 'Changeover Count', current: '6', proposed: '4', change: '-33%', positive: true },
];

function GanttChart({ data, label }: { data: GanttJob[]; label: string }) {
  const totalHours = 8;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => i);

  return (
    <div>
      <h4 className="text-sm font-semibold text-surface-700 mb-3">{label}</h4>
      <div className="space-y-2">
        {data.map((row) => (
          <div key={row.machine} className="flex items-center gap-3">
            <span className="text-xs font-medium text-surface-600 w-20 shrink-0">{row.machine}</span>
            <div className="flex-1 relative h-8 bg-surface-100 rounded overflow-hidden">
              {row.jobs.map((job, idx) => {
                const leftPct = (job.start / totalHours) * 100;
                const widthPct = (job.duration / totalHours) * 100;
                return (
                  <div
                    key={idx}
                    className={`absolute top-0 h-full ${job.color} flex items-center justify-center`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                    title={`${job.name} (${job.duration}h)`}
                  >
                    {widthPct > 8 && (
                      <span className="text-[10px] font-medium text-white drop-shadow truncate px-1">
                        {job.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className="w-20 shrink-0" />
        <div className="flex-1 flex justify-between">
          {hours.map((h) => (
            <span key={h} className="text-[10px] text-surface-400">
              {h}h
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SchedulingAssessment() {
  const [selectedProcess, setSelectedProcess] = useState(PROCESSES[0]);
  const [approvedId, setApprovedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-surface-50">
      <Header
        title="Scheduling Assessment"
        subtitle="Job scheduling optimization and KPI impact analysis"
      />

      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-surface-900">Process / Scope</h2>
            <p className="text-sm text-surface-500">Select the target area for scheduling optimization</p>
          </div>
          <div className="relative">
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="appearance-none bg-white border border-surface-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              {PROCESSES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-surface-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-surface-900">Recommended Scenarios</h2>
            <HelpPopover
              text="The system generates AI-driven scheduling strategies. Review each scenario's KPI impact, approve one to apply, or click Adjust to fine-tune parameters before applying."
              linkTo="/help"
              linkLabel="Scheduling tutorial"
              position="bottom-right"
            />
          </div>
          <p className="text-sm text-surface-500 mb-4">
            AI-generated scheduling strategies for {selectedProcess}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SCENARIOS.map((scenario) => {
              const isApproved = approvedId === scenario.id;
              return (
                <div
                  key={scenario.id}
                  className={`bg-white rounded-xl border p-5 flex flex-col transition-all ${
                    isApproved
                      ? 'border-green-400 ring-2 ring-green-100'
                      : 'border-surface-200 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-surface-900">{scenario.name}</h3>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500 mb-4 flex-1">{scenario.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {scenario.kpis.map((kpi) => (
                      <span
                        key={kpi.label}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
                          kpi.positive
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {kpi.positive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {kpi.label}: {kpi.value}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => setApprovedId(scenario.id)}
                      disabled={isApproved}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isApproved
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isApproved ? 'Applied' : 'Approve & Apply'}
                    </button>
                    <button className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-surface-600 border border-surface-200 rounded-lg hover:bg-surface-50 transition-colors">
                      <RefreshCw className="w-4 h-4" />
                      Adjust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-primary-500" />
            <h2 className="text-base font-semibold text-surface-900">
              Gantt Timeline — {selectedProcess}
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GanttChart data={CURRENT_GANTT} label="Current Schedule" />
            <GanttChart data={PROPOSED_GANTT} label="Proposed Schedule" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3 pt-3 border-t border-surface-100">
            {[
              { color: 'bg-blue-400', label: 'Job 1' },
              { color: 'bg-green-400', label: 'Job 2' },
              { color: 'bg-orange-400', label: 'Job 3' },
              { color: 'bg-teal-400', label: 'Job 4' },
              { color: 'bg-rose-400', label: 'Job 5' },
              { color: 'bg-sky-400', label: 'Job 6' },
              { color: 'bg-amber-400', label: 'Job 7' },
              { color: 'bg-cyan-400', label: 'Job 8' },
              { color: 'bg-red-400', label: 'Job 9' },
              { color: 'bg-surface-200', label: 'Idle' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${item.color}`} />
                <span className="text-xs text-surface-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <h2 className="text-base font-semibold text-surface-900">Current vs. Proposed Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left py-3 px-4 font-semibold text-surface-700">Metric</th>
                  <th className="text-right py-3 px-4 font-semibold text-surface-700">Current</th>
                  <th className="text-right py-3 px-4 font-semibold text-surface-700">Proposed</th>
                  <th className="text-right py-3 px-4 font-semibold text-surface-700">Change</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_METRICS.map((metric) => (
                  <tr key={metric.label} className="border-b border-surface-100 last:border-b-0">
                    <td className="py-3 px-4 font-medium text-surface-800">{metric.label}</td>
                    <td className="py-3 px-4 text-right text-surface-600">{metric.current}</td>
                    <td className="py-3 px-4 text-right font-medium text-surface-900">{metric.proposed}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          metric.positive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {metric.positive ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {metric.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
