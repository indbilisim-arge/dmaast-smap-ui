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
} from 'recharts';
import { GitCompare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface ComparisonMetric {
  id: string;
  name: string;
  currentValue: number;
  scenarioValue: number;
  unit: string;
  format?: 'number' | 'percentage' | 'currency';
  higherIsBetter?: boolean;
}

export interface ComparisonChartData {
  label: string;
  current: number;
  scenario: number;
}

interface ComparisonViewProps {
  metrics: ComparisonMetric[];
  chartData?: ComparisonChartData[];
  chartType?: 'bar' | 'line';
  title?: string;
  showChart?: boolean;
}

export default function ComparisonView({
  metrics,
  chartData,
  chartType = 'bar',
  title = 'Current vs. Scenario Comparison',
  showChart = true,
}: ComparisonViewProps) {
  const formatValue = (value: number, format?: string, unit?: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (format === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  };

  const getChangeIndicator = (current: number, scenario: number, higherIsBetter = true) => {
    const change = ((scenario - current) / current) * 100;
    const isPositive = higherIsBetter ? change > 0 : change < 0;
    const isNeutral = Math.abs(change) < 0.5;

    if (isNeutral) {
      return {
        icon: Minus,
        color: 'text-surface-500',
        bgColor: 'bg-surface-100',
        label: 'No change',
        value: '0%',
      };
    }

    return {
      icon: change > 0 ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-100' : 'bg-red-100',
      label: change > 0 ? 'Increase' : 'Decrease',
      value: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
    };
  };

  const generatedChartData: ComparisonChartData[] = chartData || metrics.map(m => ({
    label: m.name,
    current: m.currentValue,
    scenario: m.scenarioValue,
  }));

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-surface-200">
        <div className="p-2 bg-teal-100 rounded-lg">
          <GitCompare className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="font-semibold text-surface-900">{title}</h3>
          <p className="text-sm text-surface-500">Side-by-side analysis of current state vs. simulated scenario</p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-surface-700 mb-3">Metric Comparison</h4>
            <div className="space-y-3">
              {metrics.map(metric => {
                const indicator = getChangeIndicator(metric.currentValue, metric.scenarioValue, metric.higherIsBetter);
                const Icon = indicator.icon;

                return (
                  <div
                    key={metric.id}
                    className="p-3 rounded-lg bg-surface-50 border border-surface-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-surface-700">{metric.name}</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${indicator.bgColor}`}>
                        <Icon className={`w-3 h-3 ${indicator.color}`} />
                        <span className={`text-xs font-medium ${indicator.color}`}>{indicator.value}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
                          <span>Current</span>
                          <span className="font-medium text-surface-700">
                            {formatValue(metric.currentValue, metric.format, metric.unit)}
                          </span>
                        </div>
                        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-surface-400 rounded-full"
                            style={{
                              width: `${Math.min(100, (metric.currentValue / Math.max(metric.currentValue, metric.scenarioValue)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
                          <span>Scenario</span>
                          <span className="font-medium text-primary-600">
                            {formatValue(metric.scenarioValue, metric.format, metric.unit)}
                          </span>
                        </div>
                        <div className="h-2 bg-primary-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (metric.scenarioValue / Math.max(metric.currentValue, metric.scenarioValue)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {showChart && generatedChartData.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-surface-700 mb-3">Visual Comparison</h4>
              <div className="h-72 bg-surface-50 rounded-lg p-3">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart
                      data={generatedChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={true} vertical={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} stroke="#737373" />
                      <YAxis dataKey="label" type="category" tick={{ fontSize: 10 }} stroke="#737373" width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="current" fill="#9ca3af" name="Current" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="scenario" fill="#0066b3" name="Scenario" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart
                      data={generatedChartData}
                      margin={{ top: 5, right: 20, bottom: 5, left: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#737373" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#737373" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e5e5',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="current"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        dot={{ fill: '#9ca3af', r: 4 }}
                        name="Current"
                      />
                      <Line
                        type="monotone"
                        dataKey="scenario"
                        stroke="#0066b3"
                        strokeWidth={2}
                        dot={{ fill: '#0066b3', r: 4 }}
                        name="Scenario"
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
