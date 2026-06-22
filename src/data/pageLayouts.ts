import type { UserRole } from '../contexts/RoleContext';
import type { KpiData } from '../types';
import type { LayoutItem, LayoutItemDefinition, PageId, PageLayoutConfig } from '../types/pageLayout';
import { dashboardKpis } from './mockData';

const ALL_ROLES: UserRole[] = ['manager', 'engineer', 'operator', 'admin', 'developer', 'superuser'];

function fullDefault(ids: string[]): Record<UserRole, string[]> {
  return Object.fromEntries(ALL_ROLES.map((role) => [role, ids])) as Record<UserRole, string[]>;
}

function buildLayoutItems(
  definitions: LayoutItemDefinition[],
  visibleIds: string[],
): LayoutItem[] {
  const visibleSet = new Set(visibleIds);
  const orderedVisible = visibleIds
    .map((id) => definitions.find((d) => d.id === id))
    .filter((d): d is LayoutItemDefinition => Boolean(d));

  const hidden = definitions.filter((d) => !visibleSet.has(d.id));

  return [...orderedVisible, ...hidden].map((item, index) => ({
    ...item,
    visible: visibleSet.has(item.id),
    order: index,
  }));
}

export function getRoleDefaultLayout(pageId: PageId, role: UserRole): LayoutItem[] {
  const config = PAGE_LAYOUTS[pageId];
  const visibleIds = config.roleDefaults[role] ?? config.roleDefaults.engineer;
  return buildLayoutItems(config.items, visibleIds);
}

export const PAGE_LAYOUTS: Record<PageId, PageLayoutConfig> = {
  dashboard: {
    pageId: 'dashboard',
    label: 'Dashboard',
    items: [
      { id: 'quick-stats', title: 'Quick Stats', type: 'widget' },
      { id: 'kpi-primary', title: 'Primary KPIs', type: 'widget' },
      { id: 'production-trend', title: 'Production Trend', type: 'widget' },
      { id: 'muda-analysis', title: 'MUDA Analysis', type: 'widget' },
      { id: 'waste-reduction', title: 'Waste Reduction', type: 'widget' },
      { id: 'alerts', title: 'Recent Alerts', type: 'widget' },
      { id: 'hitl-tasks', title: 'Validation Tasks', type: 'widget' },
      { id: 'kpi-secondary', title: 'Secondary KPIs', type: 'widget' },
    ],
    roleDefaults: {
      manager: ['quick-stats', 'kpi-primary', 'production-trend', 'muda-analysis', 'waste-reduction', 'alerts', 'hitl-tasks', 'kpi-secondary'],
      engineer: ['quick-stats', 'kpi-primary', 'production-trend', 'waste-reduction', 'hitl-tasks', 'kpi-secondary'],
      operator: ['quick-stats', 'alerts', 'hitl-tasks'],
      admin: ['quick-stats', 'kpi-primary', 'production-trend', 'muda-analysis', 'waste-reduction', 'alerts', 'hitl-tasks', 'kpi-secondary'],
      developer: ['quick-stats', 'kpi-primary', 'production-trend', 'hitl-tasks'],
      superuser: ['quick-stats', 'kpi-primary', 'production-trend', 'muda-analysis', 'waste-reduction', 'alerts', 'hitl-tasks', 'kpi-secondary'],
    },
  },
  'value-chain': {
    pageId: 'value-chain',
    label: 'Value Chain',
    items: [
      { id: 'lead-time', title: 'End-to-End Lead Time', type: 'kpi' },
      { id: 'delivery-accuracy', title: 'Delivery Accuracy', type: 'kpi' },
      { id: 'inventory-turnover', title: 'Inventory Turnover', type: 'kpi' },
      { id: 'supplier-reliability', title: 'Supplier Reliability', type: 'kpi' },
      { id: 'production-throughput', title: 'Production Throughput', type: 'kpi' },
      { id: 'cost-efficiency', title: 'Cost Efficiency', type: 'kpi' },
      { id: 'supply-chain-flow', title: 'Supply Chain Flow', type: 'card' },
      { id: 'lead-time-trend', title: 'Lead Time Trend', type: 'card' },
      { id: 'order-status', title: 'Order Status', type: 'card' },
      { id: 'network-nodes', title: 'Network Nodes', type: 'card' },
    ],
    roleDefaults: {
      manager: ['lead-time', 'delivery-accuracy', 'inventory-turnover', 'supplier-reliability', 'supply-chain-flow', 'lead-time-trend', 'order-status', 'network-nodes'],
      engineer: ['lead-time', 'delivery-accuracy', 'inventory-turnover', 'supplier-reliability', 'production-throughput', 'supply-chain-flow', 'lead-time-trend', 'order-status', 'network-nodes'],
      operator: ['lead-time', 'delivery-accuracy', 'order-status', 'network-nodes'],
      admin: ['lead-time', 'delivery-accuracy', 'inventory-turnover', 'supplier-reliability', 'production-throughput', 'cost-efficiency', 'supply-chain-flow', 'lead-time-trend', 'order-status', 'network-nodes'],
      developer: ['lead-time', 'delivery-accuracy', 'inventory-turnover', 'supplier-reliability', 'supply-chain-flow', 'lead-time-trend', 'order-status', 'network-nodes'],
      superuser: ['lead-time', 'delivery-accuracy', 'inventory-turnover', 'supplier-reliability', 'production-throughput', 'cost-efficiency', 'supply-chain-flow', 'lead-time-trend', 'order-status', 'network-nodes'],
    },
  },
  manufacturing: {
    pageId: 'manufacturing',
    label: 'Manufacturing',
    items: [
      { id: 'equipment-availability', title: 'Equipment Availability', type: 'kpi' },
      { id: 'production-throughput', title: 'Production Throughput', type: 'kpi' },
      { id: 'oee', title: 'OEE', type: 'kpi' },
      { id: 'yield-rate', title: 'Yield Rate', type: 'kpi' },
      { id: 'defect-rate', title: 'Defect Rate', type: 'kpi' },
      { id: 'energy-per-unit', title: 'Energy per Unit', type: 'kpi' },
      { id: 'cost-efficiency', title: 'Cost Efficiency', type: 'kpi' },
      { id: 'oee-breakdown', title: 'OEE Breakdown', type: 'card' },
      { id: 'production-output', title: 'Production Output', type: 'card' },
      { id: 'machine-status', title: 'Machine Status', type: 'card' },
      { id: 'what-if-panel', title: 'What-if Scenarios', type: 'card' },
      { id: 'cycle-time-analysis', title: 'Cycle Time Analysis', type: 'card' },
    ],
    roleDefaults: {
      manager: ['equipment-availability', 'production-throughput', 'oee', 'yield-rate', 'oee-breakdown', 'production-output', 'machine-status', 'what-if-panel'],
      engineer: ['equipment-availability', 'production-throughput', 'oee', 'yield-rate', 'defect-rate', 'energy-per-unit', 'oee-breakdown', 'production-output', 'machine-status', 'what-if-panel', 'cycle-time-analysis'],
      operator: ['equipment-availability', 'production-throughput', 'oee', 'yield-rate', 'machine-status'],
      admin: ['equipment-availability', 'production-throughput', 'oee', 'yield-rate', 'defect-rate', 'energy-per-unit', 'cost-efficiency', 'oee-breakdown', 'production-output', 'machine-status', 'what-if-panel', 'cycle-time-analysis'],
      developer: ['equipment-availability', 'production-throughput', 'oee', 'yield-rate', 'machine-status', 'what-if-panel'],
      superuser: ['equipment-availability', 'production-throughput', 'oee', 'yield-rate', 'defect-rate', 'energy-per-unit', 'oee-breakdown', 'production-output', 'machine-status', 'what-if-panel', 'cycle-time-analysis'],
    },
  },
  logistics: {
    pageId: 'logistics',
    label: 'Logistics',
    items: [
      { id: 'delivery-accuracy', title: 'Delivery Accuracy', type: 'kpi' },
      { id: 'avg-transit-time', title: 'Avg Transit Time', type: 'kpi' },
      { id: 'fleet-utilization', title: 'Fleet Utilization', type: 'kpi' },
      { id: 'transport-cost', title: 'Transport Cost', type: 'kpi' },
      { id: 'lead-time', title: 'End-to-End Lead Time', type: 'kpi' },
      { id: 'inventory-turnover', title: 'Inventory Turnover', type: 'kpi' },
      { id: 'shipment-stats', title: 'Shipment Status Cards', type: 'card' },
      { id: 'volume-trend', title: 'Volume Trend', type: 'card' },
      { id: 'route-performance', title: 'Route Performance', type: 'card' },
      { id: 'active-shipments', title: 'Active Shipments', type: 'card' },
    ],
    roleDefaults: {
      manager: ['delivery-accuracy', 'avg-transit-time', 'fleet-utilization', 'transport-cost', 'shipment-stats', 'volume-trend', 'route-performance', 'active-shipments'],
      engineer: ['delivery-accuracy', 'avg-transit-time', 'fleet-utilization', 'transport-cost', 'lead-time', 'shipment-stats', 'volume-trend', 'route-performance', 'active-shipments'],
      operator: ['delivery-accuracy', 'avg-transit-time', 'fleet-utilization', 'transport-cost', 'shipment-stats', 'active-shipments'],
      admin: ['delivery-accuracy', 'avg-transit-time', 'fleet-utilization', 'transport-cost', 'lead-time', 'inventory-turnover', 'shipment-stats', 'volume-trend', 'route-performance', 'active-shipments'],
      developer: ['delivery-accuracy', 'avg-transit-time', 'fleet-utilization', 'transport-cost', 'shipment-stats', 'volume-trend', 'active-shipments'],
      superuser: ['delivery-accuracy', 'avg-transit-time', 'fleet-utilization', 'transport-cost', 'lead-time', 'shipment-stats', 'volume-trend', 'route-performance', 'active-shipments'],
    },
  },
  product: {
    pageId: 'product',
    label: 'Product',
    items: [
      { id: 'yield-rate', title: 'Yield Rate', type: 'kpi' },
      { id: 'defect-rate', title: 'Defect Rate', type: 'kpi' },
      { id: 'first-pass-yield', title: 'First Pass Yield', type: 'kpi' },
      { id: 'rework-rate', title: 'Rework Rate', type: 'kpi' },
      { id: 'oee', title: 'OEE', type: 'kpi' },
      { id: 'production-throughput', title: 'Production Throughput', type: 'kpi' },
      { id: 'quality-trend', title: 'Quality Trend by Batch', type: 'card' },
      { id: 'defect-distribution', title: 'Defect Distribution', type: 'card' },
      { id: 'product-variants', title: 'Product Variants Performance', type: 'card' },
      { id: 'component-traceability', title: 'Component Traceability', type: 'card' },
    ],
    roleDefaults: {
      manager: ['yield-rate', 'defect-rate', 'first-pass-yield', 'rework-rate', 'quality-trend', 'defect-distribution', 'product-variants', 'component-traceability'],
      engineer: ['yield-rate', 'defect-rate', 'first-pass-yield', 'rework-rate', 'oee', 'quality-trend', 'defect-distribution', 'product-variants', 'component-traceability'],
      operator: ['yield-rate', 'defect-rate', 'first-pass-yield', 'rework-rate', 'product-variants', 'component-traceability'],
      admin: ['yield-rate', 'defect-rate', 'first-pass-yield', 'rework-rate', 'oee', 'production-throughput', 'quality-trend', 'defect-distribution', 'product-variants', 'component-traceability'],
      developer: ['yield-rate', 'defect-rate', 'first-pass-yield', 'rework-rate', 'product-variants', 'component-traceability'],
      superuser: ['yield-rate', 'defect-rate', 'first-pass-yield', 'rework-rate', 'oee', 'quality-trend', 'defect-distribution', 'product-variants', 'component-traceability'],
    },
  },
  sustainability: {
    pageId: 'sustainability',
    label: 'Sustainability',
    items: [
      { id: 'energy-per-unit', title: 'Energy per Unit', type: 'kpi' },
      { id: 'carbon-footprint', title: 'Carbon Footprint', type: 'kpi' },
      { id: 'water-consumption', title: 'Water Consumption', type: 'kpi' },
      { id: 'recycling-rate', title: 'Recycling Rate', type: 'kpi' },
      { id: 'cost-efficiency', title: 'Cost Efficiency', type: 'kpi' },
      { id: 'sustainability-scorecard', title: 'Sustainability Scorecard', type: 'card' },
      { id: 'sustainability-metrics', title: 'Sustainability Metrics', type: 'card' },
      { id: 'material-energy-flow', title: 'Material & Energy Flow', type: 'card' },
      { id: 'environmental-heatmap', title: 'Environmental Impact Heatmap', type: 'card' },
      { id: 'waste-breakdown', title: 'Waste Breakdown', type: 'card' },
      { id: 'energy-consumption', title: 'Energy Consumption Trend', type: 'card' },
      { id: 'sustainability-goals', title: 'Sustainability Goals Progress', type: 'card' },
    ],
    roleDefaults: {
      manager: ['energy-per-unit', 'carbon-footprint', 'water-consumption', 'recycling-rate', 'sustainability-scorecard', 'sustainability-metrics', 'material-energy-flow', 'sustainability-goals'],
      engineer: ['energy-per-unit', 'carbon-footprint', 'water-consumption', 'recycling-rate', 'cost-efficiency', 'sustainability-scorecard', 'sustainability-metrics', 'material-energy-flow', 'environmental-heatmap', 'waste-breakdown', 'energy-consumption', 'sustainability-goals'],
      operator: ['energy-per-unit', 'carbon-footprint', 'water-consumption', 'recycling-rate', 'sustainability-scorecard', 'sustainability-metrics', 'sustainability-goals'],
      admin: ['energy-per-unit', 'carbon-footprint', 'water-consumption', 'recycling-rate', 'cost-efficiency', 'sustainability-scorecard', 'sustainability-metrics', 'material-energy-flow', 'environmental-heatmap', 'waste-breakdown', 'energy-consumption', 'sustainability-goals'],
      developer: ['energy-per-unit', 'carbon-footprint', 'water-consumption', 'recycling-rate', 'sustainability-scorecard', 'sustainability-metrics', 'material-energy-flow', 'environmental-heatmap', 'waste-breakdown', 'energy-consumption', 'sustainability-goals'],
      superuser: ['energy-per-unit', 'carbon-footprint', 'water-consumption', 'recycling-rate', 'cost-efficiency', 'sustainability-scorecard', 'sustainability-metrics', 'material-energy-flow', 'environmental-heatmap', 'waste-breakdown', 'energy-consumption', 'sustainability-goals'],
    },
  },
  'value-chain-sim': {
    pageId: 'value-chain-sim',
    label: 'Value Chain Simulation',
    items: [
      { id: 'baseline-metrics', title: 'Baseline State Cards', type: 'card' },
      { id: 'impact-summary', title: 'Impact Summary (Results)', type: 'card' },
      { id: 'comparison-view', title: 'Comparison View (Results)', type: 'card' },
      { id: 'inventory-demand', title: 'Inventory & Demand Simulation', type: 'card' },
    ],
    roleDefaults: {
      manager: ['baseline-metrics', 'impact-summary', 'comparison-view', 'inventory-demand'],
      engineer: ['baseline-metrics', 'impact-summary', 'comparison-view', 'inventory-demand'],
      operator: ['baseline-metrics', 'inventory-demand'],
      admin: ['baseline-metrics', 'impact-summary', 'comparison-view', 'inventory-demand'],
      developer: ['baseline-metrics', 'impact-summary', 'comparison-view', 'inventory-demand'],
      superuser: ['baseline-metrics', 'impact-summary', 'comparison-view', 'inventory-demand'],
    },
  },
  'manufacturing-sim': {
    pageId: 'manufacturing-sim',
    label: 'Manufacturing Simulation',
    items: [
      { id: 'baseline-metrics', title: 'Baseline State Cards', type: 'card' },
      { id: 'impact-summary', title: 'Impact Summary (Results)', type: 'card' },
      { id: 'comparison-view', title: 'Comparison View (Results)', type: 'card' },
      { id: 'production-output', title: 'Production Output Simulation', type: 'card' },
      { id: 'machine-utilization', title: 'Machine Utilization', type: 'card' },
      { id: 'bottleneck-analysis', title: 'Bottleneck Analysis', type: 'card' },
    ],
    roleDefaults: {
      manager: ['baseline-metrics', 'impact-summary', 'comparison-view', 'production-output'],
      engineer: ['baseline-metrics', 'impact-summary', 'comparison-view', 'production-output', 'machine-utilization', 'bottleneck-analysis'],
      operator: ['baseline-metrics', 'production-output', 'machine-utilization'],
      admin: ['baseline-metrics', 'impact-summary', 'comparison-view', 'production-output', 'machine-utilization', 'bottleneck-analysis'],
      developer: ['baseline-metrics', 'impact-summary', 'comparison-view', 'production-output', 'machine-utilization', 'bottleneck-analysis'],
      superuser: ['baseline-metrics', 'impact-summary', 'comparison-view', 'production-output', 'machine-utilization', 'bottleneck-analysis'],
    },
  },
  'mo-dss': {
    pageId: 'mo-dss',
    label: 'Multi-Objective Decision Support',
    items: [
      { id: 'objective-weights', title: 'Objective Weights', type: 'card' },
      { id: 'pareto-front', title: 'Pareto Front Visualization', type: 'card' },
      { id: 'solution-comparison', title: 'Solution Comparison', type: 'card' },
      { id: 'strategy-ranking', title: 'Strategy Ranking', type: 'card' },
      { id: 'ai-recommendations', title: 'AI Recommendations', type: 'card' },
    ],
    roleDefaults: {
      manager: ['objective-weights', 'pareto-front', 'solution-comparison', 'strategy-ranking', 'ai-recommendations'],
      engineer: ['objective-weights', 'pareto-front', 'solution-comparison', 'strategy-ranking', 'ai-recommendations'],
      operator: ['objective-weights', 'strategy-ranking'],
      admin: ['objective-weights', 'pareto-front', 'solution-comparison', 'strategy-ranking', 'ai-recommendations'],
      developer: ['objective-weights', 'pareto-front', 'solution-comparison', 'strategy-ranking', 'ai-recommendations'],
      superuser: ['objective-weights', 'pareto-front', 'solution-comparison', 'strategy-ranking', 'ai-recommendations'],
    },
  },
  scheduling: {
    pageId: 'scheduling',
    label: 'Scheduling Assessment',
    items: [
      { id: 'process-scope', title: 'Process / Scope Selector', type: 'card' },
      { id: 'recommended-scenarios', title: 'Recommended Scenarios', type: 'card' },
      { id: 'gantt-timeline', title: 'Gantt Timeline', type: 'card' },
      { id: 'comparison-table', title: 'Current vs. Proposed Comparison', type: 'card' },
    ],
    roleDefaults: {
      manager: ['process-scope', 'recommended-scenarios', 'gantt-timeline', 'comparison-table'],
      engineer: ['process-scope', 'recommended-scenarios', 'gantt-timeline', 'comparison-table'],
      operator: ['process-scope', 'recommended-scenarios', 'gantt-timeline'],
      admin: ['process-scope', 'recommended-scenarios', 'gantt-timeline', 'comparison-table'],
      developer: ['process-scope', 'recommended-scenarios', 'gantt-timeline', 'comparison-table'],
      superuser: ['process-scope', 'recommended-scenarios', 'gantt-timeline', 'comparison-table'],
    },
  },
};

const PAGE_LOCAL_KPIS: Record<string, KpiData> = {
  'avg-transit-time': {
    id: 'avg-transit-time',
    label: 'Avg Transit Time',
    value: 2.3,
    unit: 'days',
    trend: -0.4,
    target: 2.0,
    cluster: 'delivery',
    sparklineData: [3.0, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.3],
  },
  'fleet-utilization': {
    id: 'fleet-utilization',
    label: 'Fleet Utilization',
    value: 87.2,
    unit: '%',
    trend: 3.1,
    target: 90,
    cluster: 'cost',
    sparklineData: [80, 82, 83, 84, 85, 86, 87, 87.2],
  },
  'transport-cost': {
    id: 'transport-cost',
    label: 'Transport Cost',
    value: 12.4,
    unit: '€/unit',
    trend: -2.1,
    target: 10,
    cluster: 'cost',
    sparklineData: [15, 14.5, 14, 13.5, 13, 12.8, 12.5, 12.4],
  },
  'first-pass-yield': {
    id: 'first-pass-yield',
    label: 'First Pass Yield',
    value: 96.5,
    unit: '%',
    trend: 1.2,
    target: 98,
    cluster: 'cost',
    sparklineData: [94, 94.5, 95, 95.5, 96, 96.2, 96.4, 96.5],
  },
  'rework-rate': {
    id: 'rework-rate',
    label: 'Rework Rate',
    value: 2.4,
    unit: '%',
    trend: -0.8,
    target: 2.0,
    cluster: 'cost',
    sparklineData: [4.0, 3.5, 3.2, 3.0, 2.8, 2.6, 2.5, 2.4],
  },
  'water-consumption': {
    id: 'water-consumption',
    label: 'Water Consumption',
    value: 18.5,
    unit: 'L/unit',
    trend: -5.2,
    target: 15,
    cluster: 'energy',
    sparklineData: [22, 21, 20, 19.5, 19, 18.8, 18.6, 18.5],
  },
  'recycling-rate': {
    id: 'recycling-rate',
    label: 'Recycling Rate',
    value: 78.4,
    unit: '%',
    trend: 4.8,
    target: 85,
    cluster: 'energy',
    sparklineData: [68, 70, 72, 74, 75, 76, 77, 78.4],
  },
};

const kpiCatalog = new Map<string, KpiData>([
  ...dashboardKpis.map((kpi) => [kpi.id, kpi] as const),
  ...Object.entries(PAGE_LOCAL_KPIS),
]);

export function getKpiData(kpiId: string): KpiData | undefined {
  return kpiCatalog.get(kpiId);
}

export function getVisibleKpis(items: LayoutItem[]): KpiData[] {
  return items
    .filter((item) => item.type === 'kpi' && item.visible)
    .sort((a, b) => a.order - b.order)
    .map((item) => getKpiData(item.id))
    .filter((kpi): kpi is KpiData => Boolean(kpi));
}

export function getStorageKey(pageId: PageId, role: UserRole): string {
  return `smap-page-layout-${pageId}-${role}`;
}

export function getAllPageIds(): PageId[] {
  return Object.keys(PAGE_LAYOUTS) as PageId[];
}

// Keep fullDefault exported for potential admin tooling
export { fullDefault, buildLayoutItems };
