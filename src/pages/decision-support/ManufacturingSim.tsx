import { useState, useCallback } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LabelList,
} from 'recharts';
import { Cpu, Zap, Clock, Target, Plus } from 'lucide-react';
import Header from '../../components/layout/Header';
import ChartInfoPopover from '../../components/shared/ChartInfoPopover';
import { ScenarioParameter } from '../../components/shared/ScenarioPanel';
import Wizard from '../../components/shared/Wizard';
import ComparisonView, { ComparisonMetric } from '../../components/shared/ComparisonView';
import ImpactSummary, { ImpactItem } from '../../components/shared/ImpactSummary';
import { useRole } from '../../contexts/RoleContext';

const productionSimData = [
  { hour: '08:00', output: 45, target: 50, oee: 82 },
  { hour: '09:00', output: 52, target: 50, oee: 88 },
  { hour: '10:00', output: 48, target: 50, oee: 85 },
  { hour: '11:00', output: 55, target: 50, oee: 91 },
  { hour: '12:00', output: 38, target: 50, oee: 72 },
  { hour: '13:00', output: 50, target: 50, oee: 87 },
  { hour: '14:00', output: 53, target: 50, oee: 89 },
  { hour: '15:00', output: 51, target: 50, oee: 86 },
];

const machineUtilizationData = [
  { machine: 'M-101', utilization: 92, downtime: 8 },
  { machine: 'M-102', utilization: 78, downtime: 22 },
  { machine: 'M-103', utilization: 95, downtime: 5 },
  { machine: 'M-104', utilization: 88, downtime: 12 },
  { machine: 'M-105', utilization: 65, downtime: 35 },
  { machine: 'M-106', utilization: 91, downtime: 9 },
];

const bottleneckData = [
  { station: 'Assembly', cycleTime: 45, taktTime: 40, bottleneck: true },
  { station: 'Machining', cycleTime: 38, taktTime: 40, bottleneck: false },
  { station: 'Inspection', cycleTime: 42, taktTime: 40, bottleneck: true },
  { station: 'Packaging', cycleTime: 35, taktTime: 40, bottleneck: false },
];

const defaultScenarioParams: ScenarioParameter[] = [
  {
    id: 'machine-availability',
    name: 'Machine Availability',
    type: 'percentage',
    currentValue: 95,
    scenarioValue: 95,
    unit: '%',
    min: 50,
    max: 100,
    category: 'equipment',
  },
  {
    id: 'shift-length',
    name: 'Shift Length',
    type: 'absolute',
    currentValue: 8,
    scenarioValue: 8,
    unit: 'hrs',
    min: 4,
    max: 12,
    category: 'resources',
  },
  {
    id: 'operators',
    name: 'Number of Operators',
    type: 'absolute',
    currentValue: 12,
    scenarioValue: 12,
    unit: '',
    min: 4,
    max: 24,
    category: 'resources',
  },
  {
    id: 'batch-size',
    name: 'Batch Size',
    type: 'absolute',
    currentValue: 100,
    scenarioValue: 100,
    unit: 'units',
    min: 10,
    max: 500,
    category: 'demand',
  },
  {
    id: 'setup-time',
    name: 'Setup Time',
    type: 'absolute',
    currentValue: 15,
    scenarioValue: 15,
    unit: 'min',
    min: 5,
    max: 60,
    category: 'equipment',
  },
  {
    id: 'quality-rate',
    name: 'Quality Rate',
    type: 'percentage',
    currentValue: 98.5,
    scenarioValue: 98.5,
    unit: '%',
    min: 85,
    max: 100,
    category: 'equipment',
  },
  {
    id: 'energy-efficiency',
    name: 'Energy Efficiency',
    type: 'percentage',
    currentValue: 100,
    scenarioValue: 100,
    unit: '%',
    min: 70,
    max: 130,
    category: 'environmental',
  },
  {
    id: 'preventive-maintenance',
    name: 'Preventive Maintenance',
    type: 'boolean',
    currentValue: true,
    scenarioValue: true,
    category: 'equipment',
  },
];

export default function ManufacturingSim() {
  const { role } = useRole();
  const isManager = role === 'manager';
  const [scenarioParams, setScenarioParams] = useState<ScenarioParameter[]>(defaultScenarioParams);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    metrics: ComparisonMetric[];
    impacts: ImpactItem[];
    scenarioName?: string;
  } | null>(null);

  const runSimulation = useCallback((params: ScenarioParameter[]) => {
    setIsSimulating(true);
    setScenarioParams(params);

    setTimeout(() => {
      const machineAvail = params.find(p => p.id === 'machine-availability')?.scenarioValue as number || 95;
      const shiftLength = params.find(p => p.id === 'shift-length')?.scenarioValue as number || 8;
      const operators = params.find(p => p.id === 'operators')?.scenarioValue as number || 12;
      const batchSize = params.find(p => p.id === 'batch-size')?.scenarioValue as number || 100;
      const setupTime = params.find(p => p.id === 'setup-time')?.scenarioValue as number || 15;
      const qualityRate = params.find(p => p.id === 'quality-rate')?.scenarioValue as number || 98.5;
      const energyEfficiency = params.find(p => p.id === 'energy-efficiency')?.scenarioValue as number || 100;
      const preventiveMaint = params.find(p => p.id === 'preventive-maintenance')?.scenarioValue as boolean ?? true;

      const availabilityFactor = machineAvail / 95;
      const shiftFactor = shiftLength / 8;
      const operatorFactor = operators / 12;
      const setupFactor = 1 - ((setupTime - 15) / 100);
      const maintenanceBonus = preventiveMaint ? 1.05 : 0.92;

      const baseOee = 85.6;
      const oeeChange = ((machineAvail - 95) * 0.8) + ((qualityRate - 98.5) * 0.5) * maintenanceBonus;
      const newOee = Math.min(99, Math.max(50, baseOee + oeeChange));

      const baseThroughput = 1248;
      const throughputFactor = availabilityFactor * shiftFactor * Math.min(operatorFactor, 1.3) * setupFactor * (qualityRate / 98.5);
      const newThroughput = Math.round(baseThroughput * throughputFactor * maintenanceBonus);

      const baseCycleTime = 42;
      const cycleTimeChange = ((setupTime - 15) * 0.2) - ((operators - 12) * 0.3) - ((machineAvail - 95) * 0.1);
      const newCycleTime = Math.max(30, baseCycleTime + cycleTimeChange);

      const energyCostChange = ((shiftLength - 8) * 8) + ((100 - energyEfficiency) * 0.5) + ((operators - 12) * 2);
      const laborCostChange = ((operators - 12) * 5) + ((shiftLength - 8) * 4);
      const totalCostChange = energyCostChange * 0.4 + laborCostChange * 0.6;

      const metrics: ComparisonMetric[] = [
        { id: 'oee', name: 'OEE', currentValue: baseOee, scenarioValue: newOee, unit: '%', higherIsBetter: true },
        { id: 'throughput', name: 'Daily Output', currentValue: baseThroughput, scenarioValue: newThroughput, unit: 'units', higherIsBetter: true },
        { id: 'cycle-time', name: 'Cycle Time', currentValue: baseCycleTime, scenarioValue: newCycleTime, unit: 'sec', higherIsBetter: false },
        { id: 'quality', name: 'Quality Rate', currentValue: 98.5, scenarioValue: qualityRate, unit: '%', higherIsBetter: true },
        { id: 'utilization', name: 'Capacity Utilization', currentValue: 85, scenarioValue: 85 * availabilityFactor * operatorFactor, unit: '%', higherIsBetter: true },
        { id: 'energy', name: 'Energy per Unit', currentValue: 0.36, scenarioValue: 0.36 * (100 / energyEfficiency), unit: 'kWh', higherIsBetter: false },
      ];

      const impacts: ImpactItem[] = [
        { id: 'throughput-impact', label: 'Production Output', change: ((newThroughput - baseThroughput) / baseThroughput) * 100, category: 'production', higherIsBetter: true, severity: Math.abs((newThroughput - baseThroughput) / baseThroughput * 100) > 15 ? 'high' : 'medium' },
        { id: 'oee-impact', label: 'OEE', change: oeeChange, category: 'quality', higherIsBetter: true },
        { id: 'cost-impact', label: 'Operating Cost', change: totalCostChange, category: 'cost', higherIsBetter: false, severity: Math.abs(totalCostChange) > 15 ? 'high' : Math.abs(totalCostChange) > 8 ? 'medium' : 'low' },
        { id: 'energy-impact', label: 'Energy Usage', change: energyCostChange, category: 'energy', higherIsBetter: false },
        { id: 'cycle-impact', label: 'Cycle Time', change: ((newCycleTime - baseCycleTime) / baseCycleTime) * -100, category: 'time', higherIsBetter: false },
        { id: 'bottleneck-impact', label: 'Bottleneck Risk', change: setupTime > 20 || operators < 10 ? 15 : setupTime < 10 && operators >= 12 ? -10 : 0, category: 'other', higherIsBetter: false },
      ];

      setSimulationResults({ metrics, impacts });
      setIsSimulating(false);
    }, 1500);
  }, []);

  const handleReset = () => {
    setScenarioParams(defaultScenarioParams);
    setSimulationResults(null);
  };

  const [showWizard, setShowWizard] = useState(false);
  const [wizardParams, setWizardParams] = useState<ScenarioParameter[]>(defaultScenarioParams);
  const [wizardScenarioName, setWizardScenarioName] = useState('');

  const handleWizardComplete = () => {
    setScenarioParams(wizardParams);
    runSimulation(wizardParams);
    setShowWizard(false);
    setWizardScenarioName('');
    setWizardParams(defaultScenarioParams);
  };

  const handleWizardParamChange = (id: string, value: number | boolean) => {
    setWizardParams(prev =>
      prev.map(p => (p.id === id ? { ...p, scenarioValue: value } : p))
    );
  };

  const wizardSteps = [
    {
      id: 'name',
      title: 'Scenario Name',
      description: 'Give your manufacturing scenario a descriptive name',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Scenario Name</label>
            <input
              type="text"
              value={wizardScenarioName}
              onChange={e => setWizardScenarioName(e.target.value)}
              placeholder="e.g., High Availability Shift"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <p className="text-sm text-surface-500">
            Model different manufacturing line configurations including machine availability, shift patterns, operator counts, and quality targets to forecast production KPIs.
          </p>
        </div>
      ),
    },
    {
      id: 'params',
      title: 'Configure Parameters',
      description: 'Adjust scenario parameters to define your what-if conditions',
      content: (
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
          {wizardParams
            .filter(p => p.type !== 'boolean')
            .map(param => (
              <div key={param.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-surface-700">{param.name}</label>
                  <span className="text-sm font-semibold text-surface-900">
                    {param.scenarioValue as number}{param.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  value={param.scenarioValue as number}
                  onChange={e => handleWizardParamChange(param.id, Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-surface-400">
                  <span>{param.min}{param.unit}</span>
                  <span className="text-surface-500">Current: {param.currentValue as number}{param.unit}</span>
                  <span>{param.max}{param.unit}</span>
                </div>
              </div>
            ))}
        </div>
      ),
    },
    {
      id: 'review',
      title: 'Review & Run',
      description: 'Review your scenario configuration before running the simulation',
      content: (
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-surface-700 mb-2">Scenario Summary</h4>
            <div className="text-sm">
              <span className="text-surface-500">Name:</span>{' '}
              <span className="font-medium text-surface-900">{wizardScenarioName || 'Untitled'}</span>
            </div>
          </div>
          <div className="bg-surface-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-surface-700 mb-2">Modified Parameters</h4>
            <div className="space-y-1.5">
              {wizardParams.filter(p => p.scenarioValue !== p.currentValue).length === 0 ? (
                <p className="text-sm text-surface-500">No parameters changed from defaults.</p>
              ) : (
                wizardParams.filter(p => p.scenarioValue !== p.currentValue).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <span className="text-surface-600">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-surface-400">{String(p.currentValue)}{p.unit}</span>
                      <span className="text-surface-300">&rarr;</span>
                      <span className="font-semibold text-primary-700">{String(p.scenarioValue)}{p.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <p className="text-xs text-surface-500">
            Clicking "Complete" will run the simulation with these parameters. Results will appear below.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Manufacturing Simulation"
        subtitle="Production line modeling and bottleneck analysis"
      />

      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-medium text-surface-500 mb-2 uppercase tracking-wide">Current state (baseline from Digital Twin)</p>
          <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Target className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm text-surface-600">Daily Output</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">1,248</div>
            <div className="text-xs text-green-600 mt-1">+4.2% vs target</div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Cpu className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-surface-600">Avg OEE</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">85.6%</div>
            <div className="text-xs text-surface-500 mt-1">Target: 90%</div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-surface-600">Cycle Time</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">42 sec</div>
            <div className="text-xs text-amber-600 mt-1">Takt: 40 sec</div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-sm text-surface-600">Bottlenecks</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">2</div>
            <div className="text-xs text-red-600 mt-1">Stations identified</div>
          </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div />
          <button
            onClick={() => {
              setWizardParams(defaultScenarioParams);
              setWizardScenarioName('');
              setShowWizard(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Scenario Wizard
          </button>
        </div>

        {showWizard && (
          <Wizard
            steps={wizardSteps}
            onComplete={handleWizardComplete}
            onCancel={() => setShowWizard(false)}
            onReset={() => {
              setWizardParams(defaultScenarioParams);
              setWizardScenarioName('');
            }}
            title="Create Manufacturing Scenario"
          />
        )}

        {simulationResults && (
          <>
            <p className="text-xs font-medium text-surface-500 uppercase tracking-wide">Simulation results — Current state vs. scenario outcome</p>
            <ImpactSummary
              impacts={simulationResults.impacts}
              scenarioName={simulationResults.scenarioName}
            />

            <ComparisonView
              metrics={simulationResults.metrics}
              chartType="bar"
            />
          </>
        )}

        <div className={`grid ${isManager ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900">Production Output Simulation</h3>
              <ChartInfoPopover
                title="Production Output Simulation"
                description="Shows hourly production output vs. target and OEE over a typical shift. These are current-state baseline values. Run a scenario to compare projected output."
              />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionSimData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737373" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="output" stroke="#0066b3" fill="#0066b3" fillOpacity={0.3} name="Output">
                    <LabelList dataKey="output" position="top" fontSize={10} fill="#0066b3" />
                  </Area>
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {!isManager && (
            <div className="bg-white rounded-xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">Machine Utilization</h3>
                <ChartInfoPopover
                  title="Machine Utilization"
                  description="Displays utilization and downtime percentages per machine. Helps identify underused or overworked equipment. These values reflect the current production state."
                />
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={machineUtilizationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis dataKey="machine" tick={{ fontSize: 12 }} stroke="#737373" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#737373" domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="utilization" stackId="a" fill="#0066b3" name="Utilization %" />
                    <Bar dataKey="downtime" stackId="a" fill="#ef4444" name="Downtime %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {!isManager && (
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-surface-900">Bottleneck Analysis</h3>
              <ChartInfoPopover
                title="Bottleneck Analysis"
                description="Compares cycle time (actual) vs. takt time (target) per station. Stations where cycle time exceeds takt time are bottlenecks. Based on current production data."
              />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bottleneckData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#737373" domain={[0, 60]} />
                  <YAxis dataKey="station" type="category" tick={{ fontSize: 12 }} stroke="#737373" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="cycleTime"
                    fill="#0066b3"
                    name="Cycle Time (sec)"
                    radius={[0, 4, 4, 0]}
                  >
                    <LabelList position="right" fontSize={10} fill="#333" />
                  </Bar>
                  <Bar
                    dataKey="taktTime"
                    fill="#d4d4d4"
                    name="Takt Time (sec)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm font-medium text-amber-800">Bottleneck Identified</div>
              <div className="text-sm text-amber-700 mt-1">
                Assembly and Inspection stations exceed takt time. Consider adding resources or optimizing processes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
