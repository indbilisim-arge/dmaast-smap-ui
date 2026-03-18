import { useState, useMemo } from 'react';
import { Play, RotateCcw, Save, FolderOpen, X, Sliders, AlertCircle, ChevronRight, Tag } from 'lucide-react';
import Tooltip from './Tooltip';

export interface ScenarioParameter {
  id: string;
  name: string;
  type: 'percentage' | 'absolute' | 'boolean' | 'select';
  currentValue: number | boolean | string;
  scenarioValue: number | boolean | string;
  unit?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
  category: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: ScenarioParameter[];
  createdAt: Date;
  folder: string;
  tags: string[];
}

interface ScenarioPanelProps {
  parameters: ScenarioParameter[];
  onRunSimulation: (parameters: ScenarioParameter[]) => void;
  onReset: () => void;
  onSave?: (scenario: Scenario) => void;
  onLoad?: (scenario: Scenario) => void;
  savedScenarios?: Scenario[];
  isSimulating?: boolean;
}

const STORAGE_KEY = 'scenario-panel-saved-scenarios';

const PREDEFINED_FOLDERS = ['Production', 'Supply Chain', 'What-If', 'Cost Analysis', 'Custom'];

const TAG_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-red-100 text-red-700',
  'bg-teal-100 text-teal-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

const parameterCategories = [
  { id: 'equipment', label: 'Equipment' },
  { id: 'demand', label: 'Demand' },
  { id: 'resources', label: 'Resources' },
  { id: 'supply', label: 'Supply Chain' },
  { id: 'environmental', label: 'Environmental' },
];

function loadSavedScenarios(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function persistScenarios(scenarios: Scenario[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

export default function ScenarioPanel({
  parameters,
  onRunSimulation,
  onReset,
  onSave,
  onLoad,
  savedScenarios: externalScenarios,
  isSimulating = false,
}: ScenarioPanelProps) {
  const [localParams, setLocalParams] = useState<ScenarioParameter[]>(parameters);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [scenarioFolder, setScenarioFolder] = useState(PREDEFINED_FOLDERS[0]);
  const [scenarioTagsInput, setScenarioTagsInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [storedScenarios, setStoredScenarios] = useState<Scenario[]>(loadSavedScenarios);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([]);

  const savedScenarios = externalScenarios ?? storedScenarios;

  const allUniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    savedScenarios.forEach(s => (s.tags ?? []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [savedScenarios]);

  const filteredScenarios = useMemo(() => {
    if (activeTagFilters.length === 0) return savedScenarios;
    return savedScenarios.filter(s =>
      activeTagFilters.every(tag => (s.tags ?? []).includes(tag))
    );
  }, [savedScenarios, activeTagFilters]);

  const scenariosByFolder = useMemo(() => {
    const grouped: Record<string, Scenario[]> = {};
    filteredScenarios.forEach(s => {
      const folder = s.folder || 'Uncategorized';
      if (!grouped[folder]) grouped[folder] = [];
      grouped[folder].push(s);
    });
    return grouped;
  }, [filteredScenarios]);

  const handleParameterChange = (id: string, value: number | boolean | string) => {
    setLocalParams(prev =>
      prev.map(p => (p.id === id ? { ...p, scenarioValue: value } : p))
    );
  };

  const handleReset = () => {
    setLocalParams(parameters.map(p => ({ ...p, scenarioValue: p.currentValue })));
    onReset();
  };

  const handleSave = () => {
    if (!scenarioName.trim()) return;
    const tags = scenarioTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const scenario: Scenario = {
      id: Date.now().toString(),
      name: scenarioName,
      description: scenarioDescription,
      parameters: localParams,
      createdAt: new Date(),
      folder: scenarioFolder,
      tags,
    };
    if (onSave) {
      onSave(scenario);
    } else {
      const updated = [...storedScenarios, scenario];
      setStoredScenarios(updated);
      persistScenarios(updated);
    }
    setShowSaveModal(false);
    setScenarioName('');
    setScenarioDescription('');
    setScenarioFolder(PREDEFINED_FOLDERS[0]);
    setScenarioTagsInput('');
  };

  const handleLoad = (scenario: Scenario) => {
    setLocalParams(scenario.parameters);
    onLoad?.(scenario);
    setShowLoadModal(false);
  };

  const toggleFolderCollapse = (folder: string) => {
    setCollapsedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const toggleTagFilter = (tag: string) => {
    setActiveTagFilters(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const filteredParams = activeCategory === 'all'
    ? localParams
    : localParams.filter(p => p.category === activeCategory);

  const hasChanges = localParams.some(p => p.scenarioValue !== p.currentValue);

  return (
    <div className="bg-white rounded-xl shadow-card overflow-hidden">
      <div
        className="flex items-center justify-between p-4 border-b border-surface-200 cursor-pointer hover:bg-surface-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Sliders className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-surface-900">What-If Scenario Builder</h3>
            <p className="text-sm text-surface-500">Define parameters to simulate different scenarios</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded">
              Modified
            </span>
          )}
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-surface-100">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeCategory === 'all'
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-surface-600 hover:bg-surface-100'
              }`}
            >
              All Parameters
            </button>
            {parameterCategories.map(cat => {
              const count = localParams.filter(p => p.category === cat.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-surface-600 hover:bg-surface-100'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredParams.map(param => (
              <ParameterInput
                key={param.id}
                parameter={param}
                onChange={handleParameterChange}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-surface-100">
            <div className="flex items-center gap-2">
              <Tooltip content="Load saved scenario">
                <button
                  onClick={() => setShowLoadModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Load</span>
                </button>
              </Tooltip>
              <Tooltip content="Save current scenario">
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                  disabled={!hasChanges}
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <Tooltip content="Reset all parameters to current values">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </Tooltip>
              <Tooltip content="Run simulation with current parameters">
                <button
                  onClick={() => onRunSimulation(localParams)}
                  disabled={isSimulating || !hasChanges}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSimulating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Simulation
                    </>
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">Save Scenario</h3>
              <Tooltip content="Close">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="p-1 text-surface-400 hover:text-surface-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Scenario Name
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={e => setScenarioName(e.target.value)}
                  placeholder="e.g., High Demand Q4"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Description
                </label>
                <textarea
                  value={scenarioDescription}
                  onChange={e => setScenarioDescription(e.target.value)}
                  placeholder="Describe this scenario..."
                  rows={3}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  Folder
                </label>
                <select
                  value={scenarioFolder}
                  onChange={e => setScenarioFolder(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {PREDEFINED_FOLDERS.map(folder => (
                    <option key={folder} value={folder}>{folder}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Tags
                  </span>
                </label>
                <input
                  type="text"
                  value={scenarioTagsInput}
                  onChange={e => setScenarioTagsInput(e.target.value)}
                  placeholder="e.g., urgent, q4, high-demand (comma-separated)"
                  className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {scenarioTagsInput.trim().length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {scenarioTagsInput
                      .split(',')
                      .map(t => t.trim())
                      .filter(t => t.length > 0)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getTagColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between pt-2">
                <button
                  onClick={() => {
                    setScenarioName('');
                    setScenarioDescription('');
                    setScenarioFolder(PREDEFINED_FOLDERS[0]);
                    setScenarioTagsInput('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Form
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!scenarioName.trim()}
                    className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    Save Scenario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900">Load Scenario</h3>
              <Tooltip content="Close">
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="p-1 text-surface-400 hover:text-surface-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>

            {allUniqueTags.length > 0 && (
              <div className="mb-4 pb-3 border-b border-surface-100">
                <p className="text-xs font-medium text-surface-500 mb-2 uppercase tracking-wide">Filter by tag</p>
                <div className="flex flex-wrap gap-1.5">
                  {allUniqueTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTagFilter(tag)}
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
                        activeTagFilters.includes(tag)
                          ? `${getTagColor(tag)} ring-2 ring-offset-1 ring-primary-400`
                          : `${getTagColor(tag)} opacity-60 hover:opacity-100`
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {activeTagFilters.length > 0 && (
                    <button
                      onClick={() => setActiveTagFilters([])}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-surface-500 hover:text-surface-700 rounded-full border border-surface-200 hover:bg-surface-100 transition-colors"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredScenarios.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                <p className="text-surface-600">
                  {savedScenarios.length === 0 ? 'No saved scenarios yet' : 'No scenarios match the selected filters'}
                </p>
                <p className="text-sm text-surface-500">
                  {savedScenarios.length === 0
                    ? 'Create and save a scenario to see it here'
                    : 'Try removing some tag filters'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 overflow-y-auto flex-1">
                {Object.entries(scenariosByFolder)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([folder, scenarios]) => (
                    <div key={folder} className="mb-2">
                      <button
                        onClick={() => toggleFolderCollapse(folder)}
                        className="flex items-center gap-2 w-full px-2 py-2 text-sm font-semibold text-surface-700 hover:bg-surface-50 rounded-lg transition-colors"
                      >
                        <ChevronRight
                          className={`w-4 h-4 text-surface-400 transition-transform ${
                            collapsedFolders[folder] ? '' : 'rotate-90'
                          }`}
                        />
                        <FolderOpen className="w-4 h-4 text-primary-500" />
                        {folder}
                        <span className="text-xs font-normal text-surface-400 ml-auto">
                          {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}
                        </span>
                      </button>
                      {!collapsedFolders[folder] && (
                        <div className="ml-6 space-y-1.5 mt-1">
                          {scenarios.map(scenario => (
                            <button
                              key={scenario.id}
                              onClick={() => handleLoad(scenario)}
                              className="w-full text-left p-3 rounded-lg border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                            >
                              <p className="font-medium text-surface-900">{scenario.name}</p>
                              <p className="text-sm text-surface-500 mt-0.5">{scenario.description}</p>
                              {(scenario.tags ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {scenario.tags.map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full ${getTagColor(tag)}`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-surface-400 mt-1.5">
                                {new Date(scenario.createdAt).toLocaleDateString()}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ParameterInput({
  parameter,
  onChange,
}: {
  parameter: ScenarioParameter;
  onChange: (id: string, value: number | boolean | string) => void;
}) {
  const isModified = parameter.scenarioValue !== parameter.currentValue;
  const changePercent = parameter.type === 'percentage' || parameter.type === 'absolute'
    ? (((parameter.scenarioValue as number) - (parameter.currentValue as number)) / (parameter.currentValue as number)) * 100
    : 0;

  return (
    <div className={`p-3 rounded-lg border ${isModified ? 'border-primary-300 bg-primary-50/50' : 'border-surface-200 bg-surface-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-surface-700">{parameter.name}</label>
        {isModified && parameter.type !== 'boolean' && parameter.type !== 'select' && (
          <span className={`text-xs font-medium ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </span>
        )}
      </div>

      {parameter.type === 'boolean' ? (
        <button
          onClick={() => onChange(parameter.id, !parameter.scenarioValue)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            parameter.scenarioValue ? 'bg-primary-500' : 'bg-surface-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
              parameter.scenarioValue ? 'translate-x-6' : ''
            }`}
          />
        </button>
      ) : parameter.type === 'select' && parameter.options ? (
        <select
          value={parameter.scenarioValue as string}
          onChange={e => onChange(parameter.id, e.target.value)}
          className="w-full px-2 py-1.5 text-sm border border-surface-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {parameter.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={parameter.min ?? 0}
              max={parameter.max ?? 200}
              value={parameter.scenarioValue as number}
              onChange={e => onChange(parameter.id, parseFloat(e.target.value))}
              className="flex-1 h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex items-center gap-1 min-w-[4rem]">
              <input
                type="number"
                value={parameter.scenarioValue as number}
                onChange={e => onChange(parameter.id, parseFloat(e.target.value) || 0)}
                className="w-14 px-2 py-1 text-sm text-right border border-surface-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-surface-500">{parameter.unit || '%'}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-surface-400">
            <span>Current: {parameter.currentValue}{parameter.unit || '%'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
