import { useState, useCallback } from 'react';
import {
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
import { TrendingUp, Clock, DollarSign, Leaf, Plus } from 'lucide-react';
import Header from '../../components/layout/Header';
import ChartInfoPopover from '../../components/shared/ChartInfoPopover';
import Wizard from '../../components/shared/Wizard';
import { ScenarioParameter } from '../../components/shared/ScenarioPanel';
import ComparisonView, { ComparisonMetric } from '../../components/shared/ComparisonView';
import ImpactSummary, { ImpactItem } from '../../components/shared/ImpactSummary';
import { useRole } from '../../contexts/RoleContext';
const supplyChainSimData = [
  { day: 1, inventory: 15000, demand: 1200, fulfilled: 1200 },
  { day: 2, inventory: 13800, demand: 1350, fulfilled: 1350 },
  { day: 3, inventory: 12450, demand: 1100, fulfilled: 1100 },
  { day: 4, inventory: 16350, demand: 1250, fulfilled: 1250 },
  { day: 5, inventory: 15100, demand: 1400, fulfilled: 1380 },
  { day: 6, inventory: 13720, demand: 1300, fulfilled: 1300 },
  { day: 7, inventory: 12420, demand: 1150, fulfilled: 1150 },
];

const defaultScenarioParams: ScenarioParameter[] = [
  {
    id: 'supplier-capacity',
    name: 'Supplier Capacity',
    type: 'percentage',
    currentValue: 100,
    scenarioValue: 100,
    unit: '%',
    min: 50,
    max: 150,
    category: 'supply',
  },
  {
    id: 'transport-availability',
    name: 'Transport Availability',
    type: 'percentage',
    currentValue: 100,
    scenarioValue: 100,
    unit: '%',
    min: 50,
    max: 100,
    category: 'supply',
  },
  {
    id: 'demand-change',
    name: 'Demand Forecast Change',
    type: 'percentage',
    currentValue: 100,
    scenarioValue: 100,
    unit: '%',
    min: 50,
    max: 200,
    category: 'demand',
  },
  {
    id: 'safety-stock',
    name: 'Safety Stock Level',
    type: 'percentage',
    currentValue: 20,
    scenarioValue: 20,
    unit: '%',
    min: 5,
    max: 50,
    category: 'resources',
  },
  {
    id: 'lead-time-buffer',
    name: 'Lead Time Buffer',
    type: 'absolute',
    currentValue: 2,
    scenarioValue: 2,
    unit: 'days',
    min: 0,
    max: 10,
    category: 'resources',
  },
  {
    id: 'fuel-cost',
    name: 'Fuel Cost Index',
    type: 'percentage',
    currentValue: 100,
    scenarioValue: 100,
    unit: '%',
    min: 50,
    max: 200,
    category: 'environmental',
  },
  {
    id: 'regional-sourcing',
    name: 'Regional Sourcing',
    type: 'percentage',
    currentValue: 30,
    scenarioValue: 30,
    unit: '%',
    min: 0,
    max: 100,
    category: 'environmental',
  },
];

const scenarioTypes = [
  { id: 'disruption', label: 'Supply Disruption', description: 'Model supplier outage or capacity reduction scenarios' },
  { id: 'demand-shift', label: 'Demand Shift', description: 'Simulate demand increase, decrease, or seasonal changes' },
  { id: 'cost-change', label: 'Cost Variation', description: 'Analyze impact of fuel, material, or transport cost changes' },
  { id: 'custom', label: 'Custom Scenario', description: 'Configure all parameters freely' },
];

export default function ValueChainSim() {
  const { role } = useRole();
  const [scenarioParams, setScenarioParams] = useState<ScenarioParameter[]>(defaultScenarioParams);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResults, setSimulationResults] = useState<{
    metrics: ComparisonMetric[];
    impacts: ImpactItem[];
    scenarioName?: string;
  } | null>(null);

  const [showWizard, setShowWizard] = useState(false);
  const [wizardScenarioType, setWizardScenarioType] = useState('custom');
  const [wizardScenarioName, setWizardScenarioName] = useState('');
  const [wizardParams, setWizardParams] = useState<ScenarioParameter[]>(defaultScenarioParams);

  const runSimulation = useCallback((params: ScenarioParameter[]) => {
    setIsSimulating(true);
    setScenarioParams(params);

    setTimeout(() => {
      const supplierCapacity = params.find(p => p.id === 'supplier-capacity')?.scenarioValue as number || 100;
      const transportAvail = params.find(p => p.id === 'transport-availability')?.scenarioValue as number || 100;
      const demandChange = params.find(p => p.id === 'demand-change')?.scenarioValue as number || 100;
      const safetyStock = params.find(p => p.id === 'safety-stock')?.scenarioValue as number || 20;
      const leadTimeBuffer = params.find(p => p.id === 'lead-time-buffer')?.scenarioValue as number || 2;
      const fuelCost = params.find(p => p.id === 'fuel-cost')?.scenarioValue as number || 100;
      const regionalSourcing = params.find(p => p.id === 'regional-sourcing')?.scenarioValue as number || 30;

      const supplyCapability = Math.min(supplierCapacity, transportAvail) / 100;
      const serviceLevelBase = 96.8;
      const serviceLevelChange = (supplyCapability - 1) * 30 + (safetyStock - 20) * 0.3 - (demandChange - 100) * 0.2;
      const leadTimeChange = -(leadTimeBuffer - 2) * 0.8 + (100 - transportAvail) * 0.1 - (regionalSourcing - 30) * 0.05;
      const costChange = (safetyStock - 20) * 0.5 + (fuelCost - 100) * 0.4 - (regionalSourcing - 30) * 0.2 + (leadTimeBuffer - 2) * 0.3;
      const co2Change = (fuelCost - 100) * 0.2 - (regionalSourcing - 30) * 0.8 + (100 - transportAvail) * 0.3;
      const inventoryTurnover = 8.5 * (demandChange / 100) / (safetyStock / 20);

      const metrics: ComparisonMetric[] = [
        { id: 'service-level', name: 'Service Level', currentValue: serviceLevelBase, scenarioValue: Math.min(99.9, Math.max(80, serviceLevelBase + serviceLevelChange)), unit: '%', higherIsBetter: true },
        { id: 'lead-time', name: 'Avg Lead Time', currentValue: 12.4, scenarioValue: Math.max(5, 12.4 + leadTimeChange), unit: 'days', higherIsBetter: false },
        { id: 'cost-index', name: 'Cost Index', currentValue: 100, scenarioValue: 100 * (1 + costChange / 100), unit: '', higherIsBetter: false },
        { id: 'inventory-turnover', name: 'Inventory Turnover', currentValue: 8.5, scenarioValue: inventoryTurnover, unit: 'x/year', higherIsBetter: true },
        { id: 'fulfillment-rate', name: 'Order Fulfillment', currentValue: 98.2, scenarioValue: Math.min(100, 98.2 * supplyCapability), unit: '%', higherIsBetter: true },
        { id: 'co2-per-unit', name: 'CO2 per Unit', currentValue: 2.45, scenarioValue: 2.45 * (1 + co2Change / 100), unit: 'kg', higherIsBetter: false },
      ];

      const impacts: ImpactItem[] = [
        { id: 'cost-impact', label: 'Total Cost', change: costChange, category: 'cost', higherIsBetter: false, severity: Math.abs(costChange) > 15 ? 'high' : Math.abs(costChange) > 8 ? 'medium' : 'low' },
        { id: 'service-impact', label: 'Service Level', change: serviceLevelChange, category: 'production', higherIsBetter: true, severity: Math.abs(serviceLevelChange) > 3 ? 'high' : Math.abs(serviceLevelChange) > 1.5 ? 'medium' : 'low' },
        { id: 'lead-time-impact', label: 'Lead Time', change: leadTimeChange * -8, category: 'time', higherIsBetter: false },
        { id: 'carbon-impact', label: 'Carbon Footprint', change: co2Change, category: 'sustainability', higherIsBetter: false, severity: Math.abs(co2Change) > 20 ? 'high' : Math.abs(co2Change) > 10 ? 'medium' : 'low' },
        { id: 'resilience-impact', label: 'Supply Resilience', change: (supplierCapacity - 100) * 0.5 + (regionalSourcing - 30) * 0.3, category: 'quality', higherIsBetter: true },
        { id: 'inventory-impact', label: 'Inventory Costs', change: (safetyStock - 20) * 2, category: 'cost', higherIsBetter: false },
      ];

      setSimulationResults({ metrics, impacts });
      setIsSimulating(false);
    }, 1500);
  }, []);

  const handleWizardComplete = () => {
    setScenarioParams(wizardParams);
    runSimulation(wizardParams);
    setShowWizard(false);
    setWizardScenarioName('');
    setWizardScenarioType('custom');
    setWizardParams(defaultScenarioParams);
  };

  const handleWizardParamChange = (id: string, value: number) => {
    setWizardParams(prev =>
      prev.map(p => (p.id === id ? { ...p, scenarioValue: value } : p))
    );
  };

  const wizardSteps = [
    {
      id: 'type',
      title: 'Scenario Type',
      description: 'Choose the type of what-if scenario you want to model',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Scenario Name</label>
            <input
              type="text"
              value={wizardScenarioName}
              onChange={e => setWizardScenarioName(e.target.value)}
              placeholder="e.g., Q2 Supplier Disruption"
              className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {scenarioTypes.map(st => (
              <button
                key={st.id}
                onClick={() => setWizardScenarioType(st.id)}
                className={`text-left p-4 rounded-lg border-2 transition-colors ${
                  wizardScenarioType === st.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-200 hover:border-surface-300'
                }`}
              >
                <p className="font-medium text-surface-900 text-sm">{st.label}</p>
                <p className="text-xs text-surface-500 mt-1">{st.description}</p>
              </button>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'parameters',
      title: 'Configure Parameters',
      description: 'Adjust scenario parameters to define your what-if conditions',
      content: (
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
          {wizardParams.map(param => (
            <div key={param.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-surface-700">{param.name}</label>
                <span className="text-sm font-semibold text-surface-900">
                  {param.scenarioValue}{param.unit}
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
                <span className="text-surface-500">Current: {param.currentValue}{param.unit}</span>
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div className="text-sm"><span className="text-surface-500">Name:</span> <span className="font-medium text-surface-900">{wizardScenarioName || 'Untitled'}</span></div>
              <div className="text-sm"><span className="text-surface-500">Type:</span> <span className="font-medium text-surface-900">{scenarioTypes.find(s => s.id === wizardScenarioType)?.label}</span></div>
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
                      <span className="text-surface-400">{p.currentValue}{p.unit}</span>
                      <span className="text-surface-300">&rarr;</span>
                      <span className="font-semibold text-primary-700">{p.scenarioValue}{p.unit}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <p className="text-xs text-surface-500">
            Clicking "Complete" will run the simulation with these parameters. Results will appear below the scenario panel.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Value Chain Simulation"
        subtitle="Supply chain scenario modeling and what-if analysis"
      />

      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-medium text-surface-500 mb-2 uppercase tracking-wide">Current state (baseline from Digital Twin)</p>
          <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-sm text-surface-600">Cost Index</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">100</div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-surface-600">Lead Time</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">12.4 days</div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-surface-600">CO2/Unit</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">2.45 kg</div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-surface-600">Service Level</span>
            </div>
            <div className="text-2xl font-bold text-surface-900">96.8%</div>
          </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div />
          <button
            onClick={() => {
              setWizardParams(defaultScenarioParams);
              setWizardScenarioName('');
              setWizardScenarioType('custom');
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
              setWizardScenarioType('custom');
            }}
            title="Create New Scenario"
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

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">Inventory & Demand Simulation</h3>
            <ChartInfoPopover
              title="Inventory & Demand Simulation"
              description="Shows baseline inventory levels, daily demand, and fulfilled orders over a 7-day period. These are current-state values from the Digital Twin. Run a scenario to see projected changes."
            />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={supplyChainSimData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#737373" />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#737373" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#737373" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="inventory" stroke="#0066b3" strokeWidth={2} name="Inventory">
                  <LabelList dataKey="inventory" position="top" fontSize={10} fill="#0066b3" />
                </Line>
                <Line yAxisId="right" type="monotone" dataKey="demand" stroke="#f59e0b" strokeWidth={2} name="Demand" />
                <Line yAxisId="right" type="monotone" dataKey="fulfilled" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Fulfilled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
