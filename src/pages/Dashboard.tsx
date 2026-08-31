import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import { Activity, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import FilterBar from '../components/shared/FilterBar';
import KpiCard from '../components/shared/KpiCard';
import AlertCard from '../components/shared/AlertCard';
import { TaskListWidget } from '../components/shared/HITLValidation';
import { dashboardKpis, recentAlerts, productionTrendData, mudaData, hitlValidationTasks } from '../data/mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useRole } from '../contexts/RoleContext';
import { useToast } from '../contexts/ToastContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { usePageLayout } from '../hooks/usePageLayout';

const MUDA_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#06b6d4'];
const MUDA_PATTERN_IDS = ['muda-stripe', 'muda-dots', 'muda-crosshatch', 'muda-diagonal', 'muda-diamond', 'muda-horizontal', 'muda-zigzag'];

const WIDGET_SIZES: Record<string, 'small' | 'medium' | 'large'> = {
  'quick-stats': 'large',
  'kpi-primary': 'large',
  'production-trend': 'large',
  'muda-analysis': 'medium',
  'waste-reduction': 'large',
  'alerts': 'medium',
  'hitl-tasks': 'medium',
  'kpi-secondary': 'large',
};

interface DashboardWidget {
  id: string;
  size: 'small' | 'medium' | 'large';
}

export default function Dashboard() {
  const { t } = useLanguage();
  const { config } = useRole();
  const { showToast } = useToast();
  const { settings: a11y } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();
  const isLite = a11y.liteMode;
  const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical' && !a.acknowledged);

  useEffect(() => {
    if ((location.state as { accessDenied?: boolean })?.accessDenied) {
      showToast('warning', 'Access Denied', 'You do not have permission to access this page.');
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, showToast, navigate]);

  const [hitlTasks, setHitlTasks] = useState(hitlValidationTasks);
  const handleHitlApprove = useCallback((id: string) => {
    setHitlTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' as const } : t));
    showToast('success', 'Task Approved', 'Validation task has been approved successfully.');
  }, [showToast]);
  const handleHitlReject = useCallback((id: string) => {
    setHitlTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected' as const } : t));
    showToast('info', 'Task Rejected', 'Validation task has been rejected.');
  }, [showToast]);

  useEffect(() => {
    const shownKey = 'smap-critical-alerts-shown';
    const shown = sessionStorage.getItem(shownKey);
    if (!shown && criticalAlerts.length > 0) {
      criticalAlerts.forEach(alert => {
        showToast('error', alert.title, alert.message);
      });
      sessionStorage.setItem(shownKey, 'true');
    }
  }, []);

  const layout = usePageLayout('dashboard');

  const visibleWidgets: DashboardWidget[] = layout.visibleWidgetItems.map((item) => ({
    id: item.id,
    size: WIDGET_SIZES[item.id] || 'medium',
  }));

  const quickStats = [
    { label: t('dashboard.alerts'), value: criticalAlerts.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: t('dashboard.kpi.oee'), value: '87.5%', icon: Activity, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: t('dashboard.kpi.throughput'), value: '1,248', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Avg Lead Time', value: '12.4 days', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'quick-stats':
        return (
          <div>
            <div className="flex items-center justify-between mb-3 relative">
              <h3 className="font-semibold text-surface-900">Quick Stats</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {quickStats.map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-xl p-3 lg:p-4 flex items-center gap-3 lg:gap-4`}>
                  <div className="p-2 lg:p-3 rounded-lg bg-white shadow-sm">
                    <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs lg:text-sm text-surface-600 truncate">{stat.label}</p>
                    <p className="text-lg lg:text-2xl font-semibold text-surface-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'kpi-primary':
        return (
          <div>
            <div className="flex items-center justify-between mb-3 relative">
              <h3 className="font-semibold text-surface-900">Primary KPIs</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {dashboardKpis.slice(0, isLite ? 4 : 8).map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        );

      case 'production-trend':
        return (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-4 lg:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="font-semibold text-surface-900">Production Trend</h3>
            </div>
            <div className="h-64 lg:h-72 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={productionTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#737373" width={50} />
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
                    dataKey="actual"
                    stroke="#0066b3"
                    strokeWidth={2.5}
                    dot={{ fill: '#0066b3', r: 4, strokeWidth: 0 }}
                    name="Actual"
                  >
                    <LabelList dataKey="actual" position="top" fontSize={10} fill="#0066b3" offset={8} />
                  </Line>
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#737373"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={(props: Record<string, unknown>) => {
                      const { cx, cy, index } = props as { cx: number; cy: number; index: number };
                      return (
                        <rect
                          key={`target-dot-${index}`}
                          x={(cx as number) - 3}
                          y={(cy as number) - 3}
                          width={6}
                          height={6}
                          fill="#737373"
                          transform={`rotate(45, ${cx}, ${cy})`}
                        />
                      );
                    }}
                    name="Target"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'muda-analysis':
        if (isLite) return (
          <div className="bg-white rounded-xl shadow-card p-4 lg:p-5">
            <h3 className="font-semibold text-surface-900 mb-2">MUDA Analysis</h3>
            <p className="text-sm text-surface-500">Detailed MUDA analysis is hidden in Lite Mode for simplicity. Switch to Standard Mode to view the full breakdown.</p>
          </div>
        );
        return (
          <div className="bg-white rounded-xl shadow-card p-4 lg:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="font-semibold text-surface-900">MUDA Analysis</h3>
            </div>
            <div className="h-64 lg:h-72 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    {MUDA_COLORS.map((color, i) => {
                      const patternId = MUDA_PATTERN_IDS[i];
                      if (i === 0) return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                          <rect width="6" height="6" fill={color} />
                          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                        </pattern>
                      );
                      if (i === 1) return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
                          <rect width="6" height="6" fill={color} />
                          <circle cx="3" cy="3" r="1.5" fill="rgba(255,255,255,0.4)" />
                        </pattern>
                      );
                      if (i === 2) return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
                          <rect width="8" height="8" fill={color} />
                          <path d="M0,0 L8,8 M8,0 L0,8" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
                        </pattern>
                      );
                      if (i === 3) return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-45)">
                          <rect width="6" height="6" fill={color} />
                          <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                        </pattern>
                      );
                      if (i === 4) return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="8" height="8">
                          <rect width="8" height="8" fill={color} />
                          <rect x="2" y="2" width="4" height="4" fill="rgba(255,255,255,0.3)" transform="rotate(45,4,4)" />
                        </pattern>
                      );
                      if (i === 5) return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="6" height="6">
                          <rect width="6" height="6" fill={color} />
                          <line x1="0" y1="3" x2="6" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </pattern>
                      );
                      return (
                        <pattern key={patternId} id={patternId} patternUnits="userSpaceOnUse" width="8" height="4">
                          <rect width="8" height="4" fill={color} />
                          <polyline points="0,4 4,0 8,4" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </pattern>
                      );
                    })}
                  </defs>
                  <Pie
                    data={mudaData}
                    cx="50%"
                    cy="40%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="category"
                    label={({ cx, cy, midAngle, outerRadius: oR, category, value }: { cx: number; cy: number; midAngle: number; outerRadius: number; category: string; value: number }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = oR + 18;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          textAnchor={x > cx ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontSize={9}
                          fill="#525252"
                        >
                          {category} ({value})
                        </text>
                      );
                    }}
                  >
                    {mudaData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${MUDA_PATTERN_IDS[index % MUDA_PATTERN_IDS.length]})`}
                        strokeWidth={2}
                        stroke="#fff"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }}
                    formatter={(value: string, entry: { color?: string }, index: number) => (
                      <span style={{ color: '#525252' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 10,
                            height: 10,
                            backgroundColor: MUDA_COLORS[index % MUDA_COLORS.length],
                            marginRight: 4,
                            borderRadius: 2,
                          }}
                        />
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'waste-reduction':
        if (isLite) return (
          <div className="bg-white rounded-xl shadow-card p-4 lg:p-5">
            <h3 className="font-semibold text-surface-900 mb-2">Waste Reduction</h3>
            <p className="text-sm text-surface-500">Waste reduction details are hidden in Lite Mode. Switch to Standard Mode for the full view.</p>
          </div>
        );
        return (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-4 lg:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative">
              <h3 className="font-semibold text-surface-900">Waste Reduction Progress</h3>
            </div>
            <div className="h-64 lg:h-72 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mudaData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 10 }}>
                  <defs>
                    <pattern id="stripe-current" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                      <rect width="6" height="6" fill="#ef4444" />
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#dc2626" strokeWidth="2" />
                    </pattern>
                    <pattern id="stripe-target" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-45)">
                      <rect width="6" height="6" fill="#10b981" />
                      <line x1="0" y1="0" x2="0" y2="6" stroke="#059669" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#737373" />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} stroke="#737373" width={85} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="url(#stripe-current)" name="Current" radius={[0, 4, 4, 0]} stroke="#ef4444" strokeWidth={1}>
                    <LabelList dataKey="value" position="right" fontSize={10} fill="#525252" />
                  </Bar>
                  <Bar dataKey="target" fill="url(#stripe-target)" name="Target" radius={[0, 4, 4, 0]} stroke="#10b981" strokeWidth={1}>
                    <LabelList dataKey="target" position="right" fontSize={10} fill="#525252" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="bg-white rounded-xl shadow-card p-4 lg:p-5 overflow-hidden flex flex-col max-h-96">
            <div className="flex items-center justify-between mb-4 flex-shrink-0 relative">
              <h3 className="font-semibold text-surface-900">{t('dashboard.alerts')}</h3>
              <div className="flex items-center gap-2">
                <a href="/alerts" className="text-sm text-primary-600 hover:text-primary-700">
                  {t('dashboard.viewAll')}
                </a>
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
              {recentAlerts.slice(0, isLite ? 2 : 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} compact />
              ))}
            </div>
          </div>
        );

      case 'hitl-tasks':
        return (
          <TaskListWidget
            tasks={hitlTasks}
            onApprove={handleHitlApprove}
            onReject={handleHitlReject}
          />
        );

      case 'kpi-secondary':
        return (
          <div>
            <div className="flex items-center justify-between mb-3 relative">
              <h3 className="font-semibold text-surface-900">Secondary KPIs</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {dashboardKpis.slice(8).map((kpi) => (
                <KpiCard key={kpi.id} kpi={kpi} />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const fullWidthIds = new Set(['quick-stats', 'kpi-primary', 'kpi-secondary']);
  const chartPairIds = new Set(['production-trend', 'muda-analysis', 'waste-reduction', 'alerts', 'hitl-tasks']);

  const renderDynamicWidgets = () => {
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < visibleWidgets.length) {
      const widget = visibleWidgets[i];

      if (fullWidthIds.has(widget.id)) {
        elements.push(
          <div key={widget.id}>{renderWidget(widget.id)}</div>
        );
        i++;
        continue;
      }

      if (chartPairIds.has(widget.id)) {
        const nextIdx = i + 1;
        const nextWidget = nextIdx < visibleWidgets.length ? visibleWidgets[nextIdx] : null;

        if (nextWidget && chartPairIds.has(nextWidget.id)) {
          const isFirstLarge = widget.size === 'large';
          const isSecondLarge = nextWidget.size === 'large';

          if (isFirstLarge && !isSecondLarge) {
            elements.push(
              <div key={`grid-${widget.id}-${nextWidget.id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {renderWidget(widget.id)}
                {renderWidget(nextWidget.id)}
              </div>
            );
          } else if (!isFirstLarge && isSecondLarge) {
            elements.push(
              <div key={`grid-${widget.id}-${nextWidget.id}`} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {renderWidget(nextWidget.id)}
                {renderWidget(widget.id)}
              </div>
            );
          } else {
            elements.push(
              <div key={`grid-${widget.id}-${nextWidget.id}`} className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {renderWidget(widget.id)}
                {renderWidget(nextWidget.id)}
              </div>
            );
          }
          i += 2;
          continue;
        }

        elements.push(
          <div key={widget.id}>{renderWidget(widget.id)}</div>
        );
        i++;
        continue;
      }

      elements.push(
        <div key={widget.id}>{renderWidget(widget.id)}</div>
      );
      i++;
    }

    return elements;
  };

  return (
    <div className="min-h-screen">
      <Header title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />
        <FilterBar />

      <div className="mx-4 lg:mx-6 mt-4 px-4 py-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
        <p className="text-sm text-primary-800">
          <span className="font-semibold">Viewing as: {config.label}</span>
          <span className="mx-1.5 text-primary-400">-</span>
          <span className="text-primary-600">{config.description}</span>
        </p>
      </div>

      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        {renderDynamicWidgets()}
      </div>

    </div>
  );
}
