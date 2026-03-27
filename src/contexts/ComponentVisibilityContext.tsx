import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { UserRole } from './RoleContext';

// ─── Component Registry ──────────────────────────────────────────────────────
// Every visible component across all pages, grouped by page.
export interface ComponentDef {
  id: string;
  label: string;
  page: string;
  category: 'kpi' | 'chart' | 'card' | 'table' | 'panel' | 'widget';
}

export const COMPONENT_REGISTRY: ComponentDef[] = [
  // ── Dashboard ────────────────────────────────────────────────────────────
  { id: 'dashboard.quick-stats',        label: 'Quick Stats',               page: 'Dashboard',              category: 'card' },
  { id: 'dashboard.kpi-primary',        label: 'Primary KPIs',             page: 'Dashboard',              category: 'kpi' },
  { id: 'dashboard.production-trend',   label: 'Production Trend',         page: 'Dashboard',              category: 'chart' },
  { id: 'dashboard.muda-analysis',      label: 'MUDA Analysis',            page: 'Dashboard',              category: 'chart' },
  { id: 'dashboard.waste-reduction',    label: 'Waste Reduction Progress', page: 'Dashboard',              category: 'chart' },
  { id: 'dashboard.alerts',             label: 'Recent Alerts',            page: 'Dashboard',              category: 'widget' },
  { id: 'dashboard.hitl-tasks',         label: 'Validation Tasks',         page: 'Dashboard',              category: 'widget' },
  { id: 'dashboard.kpi-secondary',      label: 'Secondary KPIs',           page: 'Dashboard',              category: 'kpi' },

  // ── Value Chain DT ───────────────────────────────────────────────────────
  { id: 'valuechain.kpis',              label: 'Value Chain KPIs',         page: 'Value Chain DT',         category: 'kpi' },
  { id: 'valuechain.supply-chain-flow', label: 'Supply Chain Flow',        page: 'Value Chain DT',         category: 'chart' },
  { id: 'valuechain.lead-time-trend',   label: 'Lead Time Trend',          page: 'Value Chain DT',         category: 'chart' },
  { id: 'valuechain.order-status',      label: 'Order Status',             page: 'Value Chain DT',         category: 'card' },
  { id: 'valuechain.network-nodes',     label: 'Network Nodes',            page: 'Value Chain DT',         category: 'panel' },

  // ── Manufacturing DT ─────────────────────────────────────────────────────
  { id: 'manufacturing.kpis',           label: 'Manufacturing KPIs',       page: 'Manufacturing DT',       category: 'kpi' },
  { id: 'manufacturing.oee-breakdown',  label: 'OEE Breakdown',            page: 'Manufacturing DT',       category: 'chart' },
  { id: 'manufacturing.production-output', label: 'Production Output',     page: 'Manufacturing DT',       category: 'chart' },
  { id: 'manufacturing.machine-status', label: 'Machine Status',           page: 'Manufacturing DT',       category: 'panel' },
  { id: 'manufacturing.what-if',        label: 'CDT What-if Scenario',     page: 'Manufacturing DT',       category: 'panel' },
  { id: 'manufacturing.cycle-time',     label: 'Cycle Time Analysis',      page: 'Manufacturing DT',       category: 'chart' },

  // ── Logistics DT ─────────────────────────────────────────────────────────
  { id: 'logistics.kpis',               label: 'Logistics KPIs',          page: 'Logistics DT',           category: 'kpi' },
  { id: 'logistics.shipment-summary',   label: 'Shipment Summary',        page: 'Logistics DT',           category: 'card' },
  { id: 'logistics.volume-trend',       label: 'Volume Trend',             page: 'Logistics DT',           category: 'chart' },
  { id: 'logistics.route-performance',  label: 'Route Performance',        page: 'Logistics DT',           category: 'chart' },
  { id: 'logistics.active-shipments',   label: 'Active Shipments',         page: 'Logistics DT',           category: 'table' },

  // ── Product DT ───────────────────────────────────────────────────────────
  { id: 'product.kpis',                 label: 'Product KPIs',             page: 'Product DT',             category: 'kpi' },
  { id: 'product.quality-trend',        label: 'Quality Trend by Batch',   page: 'Product DT',             category: 'chart' },
  { id: 'product.defect-distribution',  label: 'Defect Distribution',      page: 'Product DT',             category: 'chart' },
  { id: 'product.variants-performance', label: 'Product Variants',         page: 'Product DT',             category: 'panel' },
  { id: 'product.traceability',         label: 'Component Traceability',   page: 'Product DT',             category: 'table' },

  // ── Sustainability DT ────────────────────────────────────────────────────
  { id: 'sustainability.scorecard',     label: 'Sustainability Scorecard', page: 'Sustainability DT',      category: 'panel' },
  { id: 'sustainability.kpis',          label: 'Sustainability KPIs',      page: 'Sustainability DT',      category: 'kpi' },
  { id: 'sustainability.metrics',       label: 'Sustainability Metrics',   page: 'Sustainability DT',      category: 'card' },
  { id: 'sustainability.material-flow', label: 'Material & Energy Flow',   page: 'Sustainability DT',      category: 'chart' },
  { id: 'sustainability.heatmap',       label: 'Environmental Heatmap',    page: 'Sustainability DT',      category: 'chart' },
  { id: 'sustainability.energy-consumption', label: 'Energy Consumption',  page: 'Sustainability DT',      category: 'chart' },
  { id: 'sustainability.waste-management', label: 'Waste Management',      page: 'Sustainability DT',      category: 'chart' },
  { id: 'sustainability.goals',         label: 'Sustainability Goals',     page: 'Sustainability DT',      category: 'panel' },

  // ── MO-DSS ───────────────────────────────────────────────────────────────
  { id: 'modss.objective-weights',      label: 'Objective Weights',        page: 'MO-DSS',                 category: 'panel' },
  { id: 'modss.pareto-front',           label: 'Pareto Front',             page: 'MO-DSS',                 category: 'chart' },
  { id: 'modss.solution-comparison',    label: 'Solution Comparison',      page: 'MO-DSS',                 category: 'chart' },
  { id: 'modss.strategy-ranking',       label: 'Strategy Ranking',         page: 'MO-DSS',                 category: 'panel' },
  { id: 'modss.ai-recommendations',     label: 'AI Recommendations',       page: 'MO-DSS',                 category: 'panel' },

  // ── Scheduling Assessment ────────────────────────────────────────────────
  { id: 'scheduling.scenarios',         label: 'Recommended Scenarios',    page: 'Scheduling',             category: 'panel' },
  { id: 'scheduling.gantt',             label: 'Gantt Timeline',           page: 'Scheduling',             category: 'chart' },
  { id: 'scheduling.comparison',        label: 'Current vs Proposed',      page: 'Scheduling',             category: 'table' },

  // ── Value Chain Simulation ───────────────────────────────────────────────
  { id: 'vcsim.baseline-kpis',          label: 'Baseline KPIs',            page: 'Value Chain Sim',        category: 'kpi' },
  { id: 'vcsim.inventory-demand',       label: 'Inventory & Demand Chart', page: 'Value Chain Sim',        category: 'chart' },

  // ── Manufacturing Simulation ─────────────────────────────────────────────
  { id: 'mfgsim.baseline-kpis',         label: 'Baseline KPIs',            page: 'Manufacturing Sim',      category: 'kpi' },
  { id: 'mfgsim.production-output',     label: 'Production Output Sim',    page: 'Manufacturing Sim',      category: 'chart' },
  { id: 'mfgsim.machine-utilization',   label: 'Machine Utilization',      page: 'Manufacturing Sim',      category: 'chart' },
  { id: 'mfgsim.bottleneck-analysis',   label: 'Bottleneck Analysis',      page: 'Manufacturing Sim',      category: 'chart' },

  // ── Alert Center ─────────────────────────────────────────────────────────
  { id: 'alerts.severity-cards',        label: 'Severity Summary Cards',   page: 'Alert Center',           category: 'card' },
  { id: 'alerts.list',                  label: 'Alert List',               page: 'Alert Center',           category: 'table' },
];

// ─── Visibility map type ──────────────────────────────────────────────────────
// { [role]: { [componentId]: boolean } }
export type RoleVisibilityMap = Record<string, Record<string, boolean>>;

const STORAGE_KEY = 'smap-admin-component-visibility';

function loadVisibility(): RoleVisibilityMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* empty */ }
  return {};
}

function saveVisibility(map: RoleVisibilityMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface ComponentVisibilityContextType {
  /** Check whether a component is visible for a given role */
  isVisible: (componentId: string, role: UserRole) => boolean;
  /** Get the full visibility map for a role */
  getRoleVisibility: (role: UserRole) => Record<string, boolean>;
  /** Toggle a single component for a role */
  toggleComponent: (role: UserRole, componentId: string) => void;
  /** Set visibility for a component */
  setComponentVisibility: (role: UserRole, componentId: string, visible: boolean) => void;
  /** Bulk-set all components for a role */
  setAllForRole: (role: UserRole, visible: boolean) => void;
  /** Bulk-set all components of a page for a role */
  setAllForPage: (role: UserRole, page: string, visible: boolean) => void;
  /** Reset a role to defaults (all visible) */
  resetRole: (role: UserRole) => void;
  /** The full map (for admin panel) */
  visibilityMap: RoleVisibilityMap;
}

const ComponentVisibilityContext = createContext<ComponentVisibilityContextType | undefined>(undefined);

export function ComponentVisibilityProvider({ children }: { children: ReactNode }) {
  const [visibilityMap, setVisibilityMap] = useState<RoleVisibilityMap>(loadVisibility);

  useEffect(() => {
    saveVisibility(visibilityMap);
  }, [visibilityMap]);

  const isVisible = useCallback(
    (componentId: string, role: UserRole): boolean => {
      const roleMap = visibilityMap[role];
      if (!roleMap) return true; // default visible
      if (roleMap[componentId] === undefined) return true;
      return roleMap[componentId];
    },
    [visibilityMap]
  );

  const getRoleVisibility = useCallback(
    (role: UserRole): Record<string, boolean> => {
      return visibilityMap[role] || {};
    },
    [visibilityMap]
  );

  const toggleComponent = useCallback((role: UserRole, componentId: string) => {
    setVisibilityMap((prev) => {
      const roleMap = { ...(prev[role] || {}) };
      const current = roleMap[componentId] === undefined ? true : roleMap[componentId];
      roleMap[componentId] = !current;
      return { ...prev, [role]: roleMap };
    });
  }, []);

  const setComponentVisibility = useCallback(
    (role: UserRole, componentId: string, visible: boolean) => {
      setVisibilityMap((prev) => {
        const roleMap = { ...(prev[role] || {}) };
        roleMap[componentId] = visible;
        return { ...prev, [role]: roleMap };
      });
    },
    []
  );

  const setAllForRole = useCallback((role: UserRole, visible: boolean) => {
    setVisibilityMap((prev) => {
      const roleMap: Record<string, boolean> = {};
      COMPONENT_REGISTRY.forEach((c) => { roleMap[c.id] = visible; });
      return { ...prev, [role]: roleMap };
    });
  }, []);

  const setAllForPage = useCallback((role: UserRole, page: string, visible: boolean) => {
    setVisibilityMap((prev) => {
      const roleMap = { ...(prev[role] || {}) };
      COMPONENT_REGISTRY.filter((c) => c.page === page).forEach((c) => {
        roleMap[c.id] = visible;
      });
      return { ...prev, [role]: roleMap };
    });
  }, []);

  const resetRole = useCallback((role: UserRole) => {
    setVisibilityMap((prev) => {
      const next = { ...prev };
      delete next[role];
      return next;
    });
  }, []);

  return (
    <ComponentVisibilityContext.Provider
      value={{
        isVisible,
        getRoleVisibility,
        toggleComponent,
        setComponentVisibility,
        setAllForRole,
        setAllForPage,
        resetRole,
        visibilityMap,
      }}
    >
      {children}
    </ComponentVisibilityContext.Provider>
  );
}

export function useComponentVisibility() {
  const ctx = useContext(ComponentVisibilityContext);
  if (!ctx) throw new Error('useComponentVisibility must be used within ComponentVisibilityProvider');
  return ctx;
}
