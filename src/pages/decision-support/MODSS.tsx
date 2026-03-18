import { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import {
  Target,
  Scale,
  Check,
  X,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  XCircle,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  Award,
  AlertTriangle,
  Crosshair,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import HelpPopover from '../../components/shared/HelpPopover';
import Wizard from '../../components/shared/Wizard';
import TooltipUI from '../../components/shared/Tooltip';
import { paretoFrontData } from '../../data/mockData';
import { useRole } from '../../contexts/RoleContext';

type RecStatus = 'pending' | 'applied' | 'dismissed';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: { cost: number; leadTime: number; sustainability: number };
  confidence: number;
  status: RecStatus;
  explanation: string;
  kpiImpact: { kpi: string; before: number; after: number; unit: string }[];
  steps: string[];
}

interface StrategyRanking {
  rank: number;
  id: string;
  name: string;
  score: number;
  costScore: number;
  leadTimeScore: number;
  sustainabilityScore: number;
  qualityScore: number;
  flexibilityScore: number;
}

const roleDefaultWeights: Record<string, { objective: string; weight: number; min: number; max: number }[]> = {
  manager: [
    { objective: 'Cost', weight: 35, min: 0, max: 100 },
    { objective: 'Lead Time', weight: 20, min: 0, max: 100 },
    { objective: 'Sustainability', weight: 15, min: 0, max: 100 },
    { objective: 'Quality', weight: 20, min: 0, max: 100 },
    { objective: 'Flexibility', weight: 10, min: 0, max: 100 },
  ],
  engineer: [
    { objective: 'Cost', weight: 20, min: 0, max: 100 },
    { objective: 'Lead Time', weight: 25, min: 0, max: 100 },
    { objective: 'Sustainability', weight: 15, min: 0, max: 100 },
    { objective: 'Quality', weight: 30, min: 0, max: 100 },
    { objective: 'Flexibility', weight: 10, min: 0, max: 100 },
  ],
  operator: [
    { objective: 'Cost', weight: 25, min: 0, max: 100 },
    { objective: 'Lead Time', weight: 30, min: 0, max: 100 },
    { objective: 'Sustainability', weight: 10, min: 0, max: 100 },
    { objective: 'Quality', weight: 25, min: 0, max: 100 },
    { objective: 'Flexibility', weight: 10, min: 0, max: 100 },
  ],
};

const managerDefaults = roleDefaultWeights.manager;

const radarData = [
  { subject: 'Cost', A: 85, B: 70, fullMark: 100 },
  { subject: 'Lead Time', A: 75, B: 90, fullMark: 100 },
  { subject: 'Sustainability', A: 80, B: 65, fullMark: 100 },
  { subject: 'Quality', A: 90, B: 85, fullMark: 100 },
  { subject: 'Flexibility', A: 70, B: 80, fullMark: 100 },
];

const strategyRankings: StrategyRanking[] = [
  { rank: 1, id: 'str-1', name: 'Balanced Optimization', score: 92, costScore: 88, leadTimeScore: 90, sustainabilityScore: 85, qualityScore: 95, flexibilityScore: 90 },
  { rank: 2, id: 'str-2', name: 'Cost-Focused Lean', score: 87, costScore: 96, leadTimeScore: 82, sustainabilityScore: 70, qualityScore: 88, flexibilityScore: 75 },
  { rank: 3, id: 'str-3', name: 'Green Supply Chain', score: 84, costScore: 72, leadTimeScore: 78, sustainabilityScore: 98, qualityScore: 85, flexibilityScore: 80 },
  { rank: 4, id: 'str-4', name: 'Speed-First Delivery', score: 81, costScore: 68, leadTimeScore: 97, sustainabilityScore: 65, qualityScore: 82, flexibilityScore: 88 },
  { rank: 5, id: 'str-5', name: 'Quality Premium', score: 78, costScore: 60, leadTimeScore: 75, sustainabilityScore: 80, qualityScore: 98, flexibilityScore: 72 },
];

const initialRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'Optimize Supplier Mix',
    description: 'Shifting 15% of orders to Supplier B could reduce costs by 8% with minimal lead time impact.',
    impact: { cost: -8, leadTime: +2, sustainability: -5 },
    confidence: 85,
    status: 'pending',
    explanation: 'Analysis of 12 months of procurement data shows Supplier B consistently offers 12% lower unit costs with comparable quality ratings (4.2 vs 4.3 out of 5). The marginal lead time increase of 2% is offset by Supplier B\'s higher on-time delivery rate of 96.5%.',
    kpiImpact: [
      { kpi: 'Unit Cost', before: 14.20, after: 13.06, unit: 'EUR' },
      { kpi: 'Avg Lead Time', before: 12.0, after: 12.24, unit: 'days' },
      { kpi: 'CO2 per Unit', before: 2.8, after: 2.66, unit: 'kg' },
      { kpi: 'Defect Rate', before: 1.2, after: 1.25, unit: '%' },
      { kpi: 'Order Flexibility', before: 85, after: 83, unit: '%' },
    ],
    steps: [
      'Review current allocation split between Supplier A (85%) and Supplier B (15%).',
      'Negotiate updated volume-based pricing with Supplier B for 30% allocation.',
      'Update procurement rules in the ERP system to route qualifying orders to Supplier B.',
      'Set up a 4-week transition period with dual-source monitoring.',
      'Monitor KPI dashboard weekly during transition and adjust if defect rate exceeds 1.5%.',
    ],
  },
  {
    id: 'rec-2',
    title: 'Increase Safety Stock',
    description: 'Raising safety stock by 10% improves service level by 3% at 5% higher holding cost.',
    impact: { cost: +5, leadTime: -15, sustainability: 0 },
    confidence: 92,
    status: 'pending',
    explanation: 'Service level analysis reveals current safety stock covers only 1.8 sigma of demand variability. Increasing buffer by 10% raises coverage to 2.1 sigma, reducing stockout probability from 7.2% to 4.1%. The holding cost increase is justified by a projected 18% reduction in expedited shipping expenses.',
    kpiImpact: [
      { kpi: 'Holding Cost', before: 48000, after: 50400, unit: 'EUR/mo' },
      { kpi: 'Service Level', before: 92.8, after: 95.9, unit: '%' },
      { kpi: 'Stockout Events', before: 14, after: 8, unit: '/month' },
      { kpi: 'Expedited Shipments', before: 22, after: 12, unit: '/month' },
      { kpi: 'Avg Lead Time', before: 12.0, after: 10.2, unit: 'days' },
    ],
    steps: [
      'Calculate revised safety stock levels for top 50 SKUs using updated demand forecasts.',
      'Submit purchase orders to replenish buffer stock within 2 weeks.',
      'Update warehouse slotting plan to accommodate additional inventory.',
      'Configure inventory management system with new reorder points.',
      'Track service level improvement over 30-day window and report to stakeholders.',
    ],
  },
  {
    id: 'rec-3',
    title: 'Consolidate Shipments',
    description: 'Weekly consolidation reduces transport costs by 12% and CO2 by 18%.',
    impact: { cost: -12, leadTime: +8, sustainability: -18 },
    confidence: 78,
    status: 'applied',
    explanation: 'Shipment frequency analysis shows 68% of outbound shipments are below 60% truck utilization. Consolidating to weekly dispatches increases average utilization to 87%, significantly reducing per-unit freight costs and emissions. Customers with SLA requirements under 5 days are excluded from consolidation.',
    kpiImpact: [
      { kpi: 'Freight Cost', before: 32000, after: 28160, unit: 'EUR/mo' },
      { kpi: 'Avg Lead Time', before: 12.0, after: 12.96, unit: 'days' },
      { kpi: 'CO2 Emissions', before: 45.0, after: 36.9, unit: 'tons/mo' },
      { kpi: 'Truck Utilization', before: 58, after: 87, unit: '%' },
      { kpi: 'Shipment Count', before: 180, after: 95, unit: '/month' },
    ],
    steps: [
      'Identify customer segments eligible for weekly consolidation (SLA > 5 days).',
      'Configure TMS routing engine for weekly batch dispatch schedules.',
      'Notify affected customers of updated delivery windows.',
      'Coordinate with carriers for optimized full-truckload scheduling.',
      'Monitor customer satisfaction scores and freight cost KPIs bi-weekly.',
    ],
  },
];

function isManagerDefault(weights: { objective: string; weight: number }[]): boolean {
  return managerDefaults.every((md, i) => weights[i]?.weight === md.weight);
}

function matchesManagerDefault(objective: string, weight: number): boolean {
  const def = managerDefaults.find((d) => d.objective === objective);
  return def ? def.weight === weight : false;
}

export default function MODSS() {
  const { role, hasPermission } = useRole();

  const getInitialWeights = () => {
    const roleKey = role as string;
    if (roleDefaultWeights[roleKey]) {
      return roleDefaultWeights[roleKey];
    }
    return managerDefaults;
  };

  const [weights, setWeights] = useState(getInitialWeights);
  const [selectedSolution, setSelectedSolution] = useState<string | null>('p3');
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [feedbackOpen, setFeedbackOpen] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideObjectives, setOverrideObjectives] = useState<{ objective: string; value: number }[]>(
    weights.map((w) => ({ objective: w.objective, value: w.weight }))
  );
  const [overrideConfirmOpen, setOverrideConfirmOpen] = useState(false);

  const resetToRoleDefault = () => {
    const roleKey = role as string;
    const defaults = roleDefaultWeights[roleKey] || managerDefaults;
    setWeights(defaults.map((d) => ({ ...d })));
  };

  const handleApply = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'applied' as RecStatus } : r))
    );
  };

  const handleDismiss = (id: string) => {
    setRecommendations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'dismissed' as RecStatus } : r))
    );
  };

  const handleOverrideConfirm = () => {
    const newWeights = weights.map((w, i) => ({
      ...w,
      weight: overrideObjectives[i]?.value ?? w.weight,
    }));
    setWeights(newWeights);
    setOverrideConfirmOpen(false);
    setOverrideOpen(false);
  };

  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  const canOverride = hasPermission('canOverrideOptimization');

  const detailRec = recommendations.find((r) => r.id === detailsOpen);

  const [showTargetWizard, setShowTargetWizard] = useState(false);
  const [wizardSelectedObjectives, setWizardSelectedObjectives] = useState<string[]>(
    weights.map(w => w.objective)
  );
  const [wizardWeights, setWizardWeights] = useState(
    weights.map(w => ({ objective: w.objective, weight: w.weight }))
  );

  const handleToggleWizardObjective = (objective: string) => {
    setWizardSelectedObjectives(prev =>
      prev.includes(objective) ? prev.filter(o => o !== objective) : [...prev, objective]
    );
  };

  const handleWizardWeightChange = (objective: string, value: number) => {
    setWizardWeights(prev =>
      prev.map(w => (w.objective === objective ? { ...w, weight: value } : w))
    );
  };

  const wizardTotalWeight = wizardWeights
    .filter(w => wizardSelectedObjectives.includes(w.objective))
    .reduce((s, w) => s + w.weight, 0);

  const handleTargetWizardComplete = () => {
    const newWeights = weights.map(w => {
      const ww = wizardWeights.find(ww2 => ww2.objective === w.objective);
      return {
        ...w,
        weight: wizardSelectedObjectives.includes(w.objective) ? (ww?.weight ?? w.weight) : 0,
      };
    });
    setWeights(newWeights);
    setShowTargetWizard(false);
  };

  const objectiveDescriptions: Record<string, string> = {
    'Cost': 'Minimize total supply chain and operational costs',
    'Lead Time': 'Reduce order-to-delivery cycle time',
    'Sustainability': 'Lower carbon footprint and environmental impact',
    'Quality': 'Maximize product and process quality metrics',
    'Flexibility': 'Improve ability to adapt to demand and supply changes',
  };

  const targetWizardSteps = [
    {
      id: 'select-objectives',
      title: 'Select Objectives',
      description: 'Choose which objectives to include in the optimization',
      content: (
        <div className="space-y-3">
          <p className="text-sm text-surface-500 mb-2">Select at least 2 objectives to optimize for.</p>
          {weights.map(obj => (
            <label
              key={obj.objective}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                wizardSelectedObjectives.includes(obj.objective)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-surface-200 hover:border-surface-300'
              }`}
            >
              <input
                type="checkbox"
                checked={wizardSelectedObjectives.includes(obj.objective)}
                onChange={() => handleToggleWizardObjective(obj.objective)}
                className="w-4 h-4 rounded border-surface-300 text-primary-500 focus:ring-primary-500"
              />
              <div className="flex-1">
                <p className="font-medium text-surface-900 text-sm">{obj.objective}</p>
                <p className="text-xs text-surface-500 mt-0.5">{objectiveDescriptions[obj.objective]}</p>
              </div>
            </label>
          ))}
          {wizardSelectedObjectives.length < 2 && (
            <p className="text-xs text-amber-600 mt-2">Please select at least 2 objectives.</p>
          )}
        </div>
      ),
      isValid: wizardSelectedObjectives.length >= 2,
    },
    {
      id: 'set-weights',
      title: 'Set Weights',
      description: 'Assign priority weights to each selected objective (total should be 100%)',
      content: (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-surface-500">Adjust each slider to set priority</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWizardWeights(prev => prev.map(w =>
                  wizardSelectedObjectives.includes(w.objective) ? { ...w, weight: 0 } : w
                ))}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear All (0%)
              </button>
              <button
                onClick={() => {
                  const count = wizardSelectedObjectives.length;
                  if (count === 0) return;
                  const equal = Math.floor(100 / count);
                  const remainder = 100 - equal * count;
                  setWizardWeights(prev => prev.map((w, i) => {
                    if (!wizardSelectedObjectives.includes(w.objective)) return w;
                    const idx = wizardSelectedObjectives.indexOf(w.objective);
                    return { ...w, weight: equal + (idx < remainder ? 1 : 0) };
                  }));
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-primary-600 hover:bg-primary-50 rounded-md border border-primary-200 transition-colors"
              >
                Distribute Equally
              </button>
            </div>
          </div>
          {wizardWeights
            .filter(w => wizardSelectedObjectives.includes(w.objective))
            .map(obj => (
              <div key={obj.objective} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-surface-700">{obj.objective}</label>
                  <span className="text-sm font-semibold text-surface-900">{obj.weight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={obj.weight}
                  onChange={e => handleWizardWeightChange(obj.objective, Number(e.target.value))}
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            ))}
          <div className={`p-3 rounded-lg border ${
            wizardTotalWeight === 100
              ? 'border-green-200 bg-green-50'
              : 'border-amber-200 bg-amber-50'
          }`}>
            <span className={`text-sm font-medium ${
              wizardTotalWeight === 100 ? 'text-green-700' : 'text-amber-700'
            }`}>
              Total: {wizardTotalWeight}% {wizardTotalWeight !== 100 && ' — Adjust to reach 100%'}
            </span>
          </div>
        </div>
      ),
      isValid: wizardTotalWeight === 100,
    },
    {
      id: 'review',
      title: 'Review & Apply',
      description: 'Review your optimization configuration before applying',
      content: (
        <div className="space-y-4">
          <div className="bg-surface-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-surface-700 mb-3">Selected Objectives & Weights</h4>
            <div className="space-y-2">
              {wizardWeights
                .filter(w => wizardSelectedObjectives.includes(w.objective))
                .sort((a, b) => b.weight - a.weight)
                .map(obj => {
                  const currentW = weights.find(w => w.objective === obj.objective);
                  const changed = currentW && currentW.weight !== obj.weight;
                  return (
                    <div key={obj.objective} className="flex items-center justify-between">
                      <span className="text-sm text-surface-700">{obj.objective}</span>
                      <div className="flex items-center gap-2">
                        {changed && (
                          <>
                            <span className="text-xs text-surface-400">{currentW?.weight}%</span>
                            <span className="text-surface-300">&rarr;</span>
                          </>
                        )}
                        <span className="text-sm font-semibold text-primary-700">{obj.weight}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          {weights.some(w => !wizardSelectedObjectives.includes(w.objective)) && (
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-xs text-amber-700">
                <strong>Disabled objectives:</strong>{' '}
                {weights.filter(w => !wizardSelectedObjectives.includes(w.objective)).map(w => w.objective).join(', ')}.
                These will be set to 0% weight.
              </p>
            </div>
          )}
          <p className="text-xs text-surface-500">
            Clicking "Complete" will apply these weights to the optimization engine and update strategy rankings.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <Header
        title="Multi-Objective Decision Support"
        subtitle="Pareto optimization and trade-off analysis"
      />

      <div className="p-6 space-y-6">
        {showTargetWizard && (
          <Wizard
            steps={targetWizardSteps}
            onComplete={handleTargetWizardComplete}
            onCancel={() => setShowTargetWizard(false)}
            onReset={() => {
              setWizardSelectedObjectives(weights.map(w => w.objective));
              setWizardWeights(weights.map(w => ({ objective: w.objective, weight: w.weight })));
            }}
            title="Set Optimization Targets"
          />
        )}

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-surface-700 uppercase tracking-wide">Objective Weights</h3>
              <HelpPopover
                text="Use the wizard to configure optimization objective weights. Weights should total 100%. Higher weight means the optimizer favors that objective more."
                linkTo="/help"
                position="bottom-right"
              />
              {isManagerDefault(weights) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                  Baseline (Manager)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setWizardSelectedObjectives(weights.map(w => w.objective));
                  setWizardWeights(weights.map(w => ({ objective: w.objective, weight: w.weight })));
                  setShowTargetWizard(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Crosshair className="w-4 h-4" />
                Set Targets Wizard
              </button>
              <button
                onClick={resetToRoleDefault}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-surface-700 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Role Default
              </button>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {weights.map((obj) => (
              <div key={obj.objective} className="text-center p-3 bg-surface-50 rounded-lg">
                <div className="text-xs text-surface-500 mb-1">{obj.objective}</div>
                <div className="text-2xl font-bold text-surface-900">{obj.weight}%</div>
                <div className="w-full bg-surface-200 rounded-full h-1.5 mt-2">
                  <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${obj.weight}%` }} />
                </div>
              </div>
            ))}
          </div>
          {totalWeight !== 100 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-sm text-amber-800">Total weight: {totalWeight}%. Use the wizard to adjust to 100%.</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="font-semibold text-surface-900">Pareto Front Visualization</h3>
              <HelpPopover
                text="A Pareto front shows the set of optimal solutions where no objective can be improved without worsening another. Each point represents a unique trade-off between cost, lead time, and sustainability."
                linkTo="/help"
                position="bottom-right"
              />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    type="number"
                    dataKey="cost"
                    name="Cost"
                    tick={{ fontSize: 12 }}
                    stroke="#737373"
                    label={{ value: 'Cost Index', position: 'bottom', fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="leadTime"
                    name="Lead Time"
                    tick={{ fontSize: 12 }}
                    stroke="#737373"
                    label={{ value: 'Lead Time (days)', angle: -90, position: 'left', fontSize: 12 }}
                  />
                  <ZAxis type="number" dataKey="sustainability" range={[100, 500]} name="CO2" />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border border-surface-200 rounded-lg shadow-lg">
                            <div className="text-sm font-medium text-surface-900">Solution {data.id}</div>
                            <div className="text-xs text-surface-600 mt-1">Cost: {data.cost}</div>
                            <div className="text-xs text-surface-600">Lead Time: {data.leadTime} days</div>
                            <div className="text-xs text-surface-600">CO2: {data.sustainability} kg/unit</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Solutions" data={paretoFrontData}>
                    {paretoFrontData.map((entry) => (
                      <Cell
                        key={entry.id}
                        fill={entry.id === selectedSolution ? '#0066b3' : '#94a3b8'}
                        stroke={entry.id === selectedSolution ? '#0066b3' : 'transparent'}
                        strokeWidth={2}
                        cursor="pointer"
                        onClick={() => setSelectedSolution(entry.id)}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary-500" />
                <span className="text-surface-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-surface-400" />
                <span className="text-surface-600">Pareto Optimal</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-card p-5">
            <h3 className="font-semibold text-surface-900 mb-4">Solution Comparison</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e5e5" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="#737373" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#737373" />
                  <Radar name="Current" dataKey="A" stroke="#0066b3" fill="#0066b3" fillOpacity={0.3} />
                  <Radar name="Alternative" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-surface-900">Strategy Ranking</h3>
          </div>
          <div className="space-y-2">
            {strategyRankings.map((strategy) => (
              <div key={strategy.id}>
                <button
                  onClick={() => setExpandedStrategy(expandedStrategy === strategy.id ? null : strategy.id)}
                  className="w-full text-left"
                >
                  <div className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    expandedStrategy === strategy.id
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-surface-200 bg-white hover:bg-surface-50'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      strategy.rank === 1 ? 'bg-primary-500 text-white' :
                      strategy.rank === 2 ? 'bg-primary-100 text-primary-700' :
                      'bg-surface-100 text-surface-600'
                    }`}>
                      {strategy.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-surface-900">{strategy.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-primary-700">Score: {strategy.score}/100</span>
                          <ChevronRight className={`w-4 h-4 text-surface-400 transition-transform ${
                            expandedStrategy === strategy.id ? 'rotate-90' : ''
                          }`} />
                        </div>
                      </div>
                      <div className="w-full bg-surface-100 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${strategy.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
                {expandedStrategy === strategy.id && (
                  <div className="ml-12 mt-2 p-4 bg-surface-50 rounded-lg border border-surface-200">
                    <div className="grid grid-cols-5 gap-4">
                      {[
                        { label: 'Cost', value: strategy.costScore },
                        { label: 'Lead Time', value: strategy.leadTimeScore },
                        { label: 'Sustainability', value: strategy.sustainabilityScore },
                        { label: 'Quality', value: strategy.qualityScore },
                        { label: 'Flexibility', value: strategy.flexibilityScore },
                      ].map((metric) => (
                        <div key={metric.label} className="text-center">
                          <div className="text-xs text-surface-500 mb-1">{metric.label}</div>
                          <div className="text-lg font-bold text-surface-900">{metric.value}</div>
                          <div className="w-full bg-surface-200 rounded-full h-1 mt-1">
                            <div
                              className="bg-primary-400 h-1 rounded-full"
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-900">AI Recommendations</h3>
            <span className="text-sm text-surface-500">Human-in-the-loop validation required</span>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border ${
                  rec.status === 'applied'
                    ? 'border-green-200 bg-green-50'
                    : rec.status === 'dismissed'
                    ? 'border-surface-200 bg-surface-50'
                    : 'border-surface-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    rec.status === 'applied' ? 'bg-green-100' :
                    rec.status === 'dismissed' ? 'bg-surface-100' : 'bg-amber-100'
                  }`}>
                    <Lightbulb className={`w-5 h-5 ${
                      rec.status === 'applied' ? 'text-green-600' :
                      rec.status === 'dismissed' ? 'text-surface-400' : 'text-amber-600'
                    }`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-surface-900">{rec.title}</h4>
                      <span className="text-xs text-surface-500">Confidence: {rec.confidence}%</span>
                    </div>
                    <p className="text-sm text-surface-600 mt-1">{rec.description}</p>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-surface-500">Cost:</span>
                        <span className={rec.impact.cost < 0 ? 'text-green-600' : 'text-red-600'}>
                          {rec.impact.cost > 0 ? '+' : ''}{rec.impact.cost}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-surface-500">Lead Time:</span>
                        <span className={rec.impact.leadTime < 0 ? 'text-green-600' : 'text-red-600'}>
                          {rec.impact.leadTime > 0 ? '+' : ''}{rec.impact.leadTime}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-surface-500">CO2:</span>
                        <span className={rec.impact.sustainability < 0 ? 'text-green-600' : 'text-red-600'}>
                          {rec.impact.sustainability > 0 ? '+' : ''}{rec.impact.sustainability}%
                        </span>
                      </div>
                    </div>

                    {feedbackOpen === rec.id && (
                      <div className="mt-3">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Enter your feedback on this recommendation..."
                          className="w-full p-2.5 text-sm border border-surface-300 rounded-lg bg-white text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                          rows={3}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              setFeedbackOpen(null);
                              setFeedbackText('');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                          >
                            Submit Feedback
                          </button>
                          <button
                            onClick={() => {
                              setFeedbackOpen(null);
                              setFeedbackText('');
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rec.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApply(rec.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Apply
                        </button>
                        <button
                          onClick={() => handleDismiss(rec.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackOpen(feedbackOpen === rec.id ? null : rec.id);
                            setFeedbackText('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          Add Feedback
                        </button>
                      </>
                    )}
                    {rec.status === 'applied' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Applied</span>
                      </div>
                    )}
                    {rec.status === 'dismissed' && (
                      <div className="flex items-center gap-1 text-surface-400">
                        <X className="w-5 h-5" />
                        <span className="text-sm font-medium">Dismissed</span>
                      </div>
                    )}
                    <button
                      onClick={() => setDetailsOpen(rec.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      See Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {canOverride && (
          <div className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-surface-900">Override Optimization</h3>
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Authorized
                </span>
              </div>
              <button
                onClick={() => {
                  setOverrideObjectives(weights.map((w) => ({ objective: w.objective, value: w.weight })));
                  setOverrideOpen(!overrideOpen);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Scale className="w-4 h-4" />
                {overrideOpen ? 'Cancel Override' : 'Manual Override'}
              </button>
            </div>
            <p className="text-sm text-surface-500 mt-2">
              Manually set optimization objectives. This bypasses the automated weighting system and requires confirmation.
            </p>

            {overrideOpen && (
              <div className="mt-4 p-4 bg-surface-50 rounded-lg border border-surface-200">
                <div className="space-y-3">
                  {overrideObjectives.map((obj, index) => (
                    <div key={obj.objective} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-surface-700 w-32">{obj.objective}</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={obj.value}
                        onChange={(e) => {
                          const newObj = [...overrideObjectives];
                          newObj[index] = { ...newObj[index], value: Number(e.target.value) };
                          setOverrideObjectives(newObj);
                        }}
                        className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm font-bold text-surface-900 w-12 text-right">{obj.value}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200">
                  <span className={`text-sm font-medium ${
                    overrideObjectives.reduce((s, o) => s + o.value, 0) === 100
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}>
                    Total: {overrideObjectives.reduce((s, o) => s + o.value, 0)}%
                  </span>
                  <button
                    onClick={() => setOverrideConfirmOpen(true)}
                    disabled={overrideObjectives.reduce((s, o) => s + o.value, 0) !== 100}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Apply Override
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {detailsOpen && detailRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailsOpen(null)} />
          <div className="relative w-full max-w-lg h-full bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-surface-200 p-5 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-surface-900">{detailRec.title}</h2>
              <TooltipUI content="Close details">
                <button
                  onClick={() => setDetailsOpen(null)}
                  className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </TooltipUI>
            </div>

            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">Why This Was Recommended</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{detailRec.explanation}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">KPI Impact Forecast</h3>
                <div className="space-y-2">
                  {detailRec.kpiImpact.map((kpi) => {
                    const delta = kpi.after - kpi.before;
                    const pct = kpi.before !== 0 ? ((delta / kpi.before) * 100) : 0;
                    const isImprovement =
                      (kpi.kpi.toLowerCase().includes('cost') || kpi.kpi.toLowerCase().includes('defect') || kpi.kpi.toLowerCase().includes('co2') || kpi.kpi.toLowerCase().includes('stockout') || kpi.kpi.toLowerCase().includes('shipment count') || kpi.kpi.toLowerCase().includes('lead time'))
                        ? delta < 0
                        : delta > 0;
                    return (
                      <div key={kpi.kpi} className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                        <span className="text-sm font-medium text-surface-700">{kpi.kpi}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-surface-500">{kpi.before} {kpi.unit}</span>
                          <ChevronRight className="w-4 h-4 text-surface-300" />
                          <span className={`text-sm font-semibold ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                            {kpi.after} {kpi.unit}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${isImprovement ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wide mb-3">Step-by-Step Guidance</h3>
                <div className="space-y-3">
                  {detailRec.steps.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-surface-600 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {overrideConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOverrideConfirmOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Confirm Override</h3>
            </div>
            <p className="text-sm text-surface-600 mb-4">
              You are about to manually override the optimization objectives. This will replace the current weights and may affect all downstream recommendations and strategy rankings.
            </p>
            <div className="bg-surface-50 rounded-lg p-3 mb-4">
              {overrideObjectives.map((obj) => (
                <div key={obj.objective} className="flex items-center justify-between py-1">
                  <span className="text-sm text-surface-600">{obj.objective}</span>
                  <span className="text-sm font-semibold text-surface-900">{obj.value}%</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setOverrideConfirmOpen(false)}
                className="px-4 py-2 text-sm font-medium text-surface-600 bg-surface-100 rounded-lg hover:bg-surface-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
              >
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
