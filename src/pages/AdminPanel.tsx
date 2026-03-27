import { useState, useMemo } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Search,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  BarChart3,
  CreditCard,
  Table,
  PanelTop,
  Gauge,
  Check,
  X,
  Filter,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useRole, type UserRole } from '../contexts/RoleContext';
import {
  useComponentVisibility,
  COMPONENT_REGISTRY,
  type ComponentDef,
} from '../contexts/ComponentVisibilityContext';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  kpi: <Gauge className="w-3.5 h-3.5" />,
  chart: <BarChart3 className="w-3.5 h-3.5" />,
  card: <CreditCard className="w-3.5 h-3.5" />,
  table: <Table className="w-3.5 h-3.5" />,
  panel: <PanelTop className="w-3.5 h-3.5" />,
  widget: <LayoutGrid className="w-3.5 h-3.5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  kpi: 'KPI',
  chart: 'Chart',
  card: 'Card',
  table: 'Table',
  panel: 'Panel',
  widget: 'Widget',
};

const CATEGORY_COLORS: Record<string, string> = {
  kpi: 'bg-violet-100 text-violet-700 border-violet-200',
  chart: 'bg-blue-100 text-blue-700 border-blue-200',
  card: 'bg-amber-100 text-amber-700 border-amber-200',
  table: 'bg-green-100 text-green-700 border-green-200',
  panel: 'bg-pink-100 text-pink-700 border-pink-200',
  widget: 'bg-teal-100 text-teal-700 border-teal-200',
};

const ROLES_EXCEPT_ADMIN: UserRole[] = ['manager', 'engineer', 'operator', 'developer', 'superuser'];

const ROLE_COLORS: Record<string, string> = {
  manager: 'bg-blue-500',
  engineer: 'bg-teal-500',
  operator: 'bg-amber-500',
  developer: 'bg-violet-500',
  superuser: 'bg-rose-500',
};

const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  engineer: 'Engineer',
  operator: 'Operator',
  developer: 'Developer',
  superuser: 'Superuser',
};

export default function AdminPanel() {
  const { role: currentRole } = useRole();
  const {
    isVisible,
    toggleComponent,
    setAllForRole,
    setAllForPage,
    resetRole,
  } = useComponentVisibility();

  const [selectedRole, setSelectedRole] = useState<UserRole>('operator');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Group components by page
  const pages = useMemo(() => {
    const map = new Map<string, ComponentDef[]>();
    COMPONENT_REGISTRY.forEach((comp) => {
      if (!map.has(comp.page)) map.set(comp.page, []);
      map.get(comp.page)!.push(comp);
    });
    return map;
  }, []);

  const pageNames = useMemo(() => Array.from(pages.keys()), [pages]);

  // Filter logic
  const filteredPages = useMemo(() => {
    const result = new Map<string, ComponentDef[]>();
    pages.forEach((components, page) => {
      const filtered = components.filter((c) => {
        const matchesSearch =
          searchQuery === '' ||
          c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.page.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
        return matchesSearch && matchesCategory;
      });
      if (filtered.length > 0) result.set(page, filtered);
    });
    return result;
  }, [pages, searchQuery, filterCategory]);

  // Stats
  const totalComponents = COMPONENT_REGISTRY.length;
  const visibleCount = COMPONENT_REGISTRY.filter((c) => isVisible(c.id, selectedRole)).length;
  const hiddenCount = totalComponents - visibleCount;

  const togglePage = (page: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const expandAll = () => setExpandedPages(new Set(pageNames));
  const collapseAll = () => setExpandedPages(new Set());

  const getPageStats = (page: string) => {
    const comps = pages.get(page) || [];
    const vis = comps.filter((c) => isVisible(c.id, selectedRole)).length;
    return { total: comps.length, visible: vis };
  };

  // Access control: only admin/superuser can use this page
  if (currentRole !== 'admin' && currentRole !== 'superuser') {
    return (
      <div className="min-h-screen">
        <Header title="Admin Panel" subtitle="Component visibility management" />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800">Access Denied</h2>
            <p className="text-sm text-red-600 mt-2">
              Only Admin and Superuser roles can access this panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Admin Panel"
        subtitle="Manage component visibility per role"
      />

      <div className="p-4 lg:p-6 space-y-5">
        {/* ── Role Selection ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Shield className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-surface-900">Select Role to Configure</h2>
              <p className="text-xs text-surface-500">
                Choose a role and toggle which components they can see across all pages
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {ROLES_EXCEPT_ADMIN.map((r) => {
              const stats = (() => {
                const vis = COMPONENT_REGISTRY.filter((c) => isVisible(c.id, r)).length;
                return { visible: vis, total: totalComponents };
              })();
              const isSelected = selectedRole === r;

              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all min-w-[160px] ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-md'
                      : 'border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${ROLE_COLORS[r]}`} />
                  <div className="text-left">
                    <div className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-surface-900'}`}>
                      {ROLE_LABELS[r]}
                    </div>
                    <div className="text-xs text-surface-500">
                      {stats.visible}/{stats.total} visible
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Stats Bar ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
            <div className="p-2 bg-surface-100 rounded-lg">
              <LayoutGrid className="w-5 h-5 text-surface-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-surface-900">{totalComponents}</div>
              <div className="text-xs text-surface-500">Total Components</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{visibleCount}</div>
              <div className="text-xs text-surface-500">Visible for {ROLE_LABELS[selectedRole]}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-card p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <EyeOff className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{hiddenCount}</div>
              <div className="text-xs text-surface-500">Hidden for {ROLE_LABELS[selectedRole]}</div>
            </div>
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-card p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-surface-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-sm border border-surface-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="kpi">KPI</option>
                  <option value="chart">Chart</option>
                  <option value="card">Card</option>
                  <option value="table">Table</option>
                  <option value="panel">Panel</option>
                  <option value="widget">Widget</option>
                </select>
              </div>

              <button
                onClick={expandAll}
                className="px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg transition-colors border border-surface-200"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-xs font-medium text-surface-600 hover:bg-surface-100 rounded-lg transition-colors border border-surface-200"
              >
                Collapse All
              </button>

              <div className="h-6 w-px bg-surface-200" />

              <button
                onClick={() => setAllForRole(selectedRole, true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
              >
                <Eye className="w-3.5 h-3.5" />
                Show All
              </button>
              <button
                onClick={() => setAllForRole(selectedRole, false)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Hide All
              </button>
              <button
                onClick={() => resetRole(selectedRole)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* ── Component List by Page ──────────────────────────────────────── */}
        <div className="space-y-3">
          {Array.from(filteredPages.entries()).map(([page, components]) => {
            const isExpanded = expandedPages.has(page);
            const stats = getPageStats(page);
            const allVisible = stats.visible === stats.total;
            const noneVisible = stats.visible === 0;

            return (
              <div key={page} className="bg-white rounded-xl shadow-card overflow-hidden">
                {/* Page Header */}
                <button
                  onClick={() => togglePage(page)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-surface-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-surface-400" />
                    )}
                    <h3 className="font-semibold text-surface-900">{page}</h3>
                    <span className="text-xs text-surface-500 bg-surface-100 px-2 py-0.5 rounded-full">
                      {stats.visible}/{stats.total}
                    </span>
                    {allVisible && (
                      <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        All Visible
                      </span>
                    )}
                    {noneVisible && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        All Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAllForPage(selectedRole, page, true);
                      }}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Show all on this page"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAllForPage(selectedRole, page, false);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Hide all on this page"
                    >
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </button>

                {/* Component rows */}
                {isExpanded && (
                  <div className="border-t border-surface-100">
                    {components.map((comp) => {
                      const visible = isVisible(comp.id, selectedRole);

                      return (
                        <div
                          key={comp.id}
                          className={`flex items-center justify-between px-5 py-3 border-b border-surface-50 last:border-b-0 transition-colors ${
                            visible ? 'bg-white' : 'bg-surface-50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${
                                CATEGORY_COLORS[comp.category]
                              }`}
                            >
                              {CATEGORY_ICONS[comp.category]}
                              {CATEGORY_LABELS[comp.category]}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                visible ? 'text-surface-900' : 'text-surface-400 line-through'
                              }`}
                            >
                              {comp.label}
                            </span>
                            <span className="text-xs text-surface-400 font-mono hidden lg:inline">
                              {comp.id}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleComponent(selectedRole, comp.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              visible ? 'bg-green-500' : 'bg-surface-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                visible ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            >
                              {visible ? (
                                <Eye className="w-2.5 h-2.5 text-green-600 absolute top-0.5 left-0.5" />
                              ) : (
                                <X className="w-2.5 h-2.5 text-surface-400 absolute top-0.5 left-0.5" />
                              )}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredPages.size === 0 && (
          <div className="bg-white rounded-xl shadow-card p-12 text-center">
            <Search className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-700">No components found</h3>
            <p className="text-sm text-surface-500 mt-1">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}

        {/* ── Info Banner ─────────────────────────────────────────────────── */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
          <p className="text-sm text-primary-800">
            <span className="font-semibold">How it works:</span> Changes are applied instantly.
            When users switch to a role via the role selector, they will only see the components
            you have enabled for that role. Settings are stored locally and persist across sessions.
          </p>
        </div>
      </div>
    </div>
  );
}
