import { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, GripVertical, X, Save } from 'lucide-react';
import Tooltip from './Tooltip';

export interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
  order: number;
}

interface DashboardCustomizerProps {
  widgets: DashboardWidget[];
  onSave: (widgets: DashboardWidget[]) => void;
  storageKey?: string;
}

export function useDashboardWidgets(defaultWidgets: DashboardWidget[], storageKey = 'smap-dashboard-widgets') {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultWidgets;
      }
    }
    return defaultWidgets;
  });

  const saveWidgets = (newWidgets: DashboardWidget[]) => {
    setWidgets(newWidgets);
    localStorage.setItem(storageKey, JSON.stringify(newWidgets));
  };

  const toggleVisibility = (id: string) => {
    const newWidgets = widgets.map(w =>
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    saveWidgets(newWidgets);
  };

  const reorderWidgets = (fromIndex: number, toIndex: number) => {
    const newWidgets = [...widgets];
    const [movedWidget] = newWidgets.splice(fromIndex, 1);
    newWidgets.splice(toIndex, 0, movedWidget);
    const reordered = newWidgets.map((w, i) => ({ ...w, order: i }));
    saveWidgets(reordered);
  };

  const resetToDefault = () => {
    saveWidgets(defaultWidgets);
  };

  const visibleWidgets = widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  return {
    widgets,
    visibleWidgets,
    saveWidgets,
    toggleVisibility,
    reorderWidgets,
    resetToDefault,
  };
}

export default function DashboardCustomizer({ widgets, onSave, storageKey }: DashboardCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localWidgets, setLocalWidgets] = useState(widgets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLocalWidgets(widgets);
  }, [widgets]);

  const handleToggleVisibility = (id: string) => {
    setLocalWidgets(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newWidgets = [...localWidgets];
    const [draggedWidget] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(index, 0, draggedWidget);
    const reordered = newWidgets.map((w, i) => ({ ...w, order: i }));
    setLocalWidgets(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onSave(localWidgets);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(localWidgets));
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    setLocalWidgets(widgets);
  };

  return (
    <>
      <Tooltip content="Customize dashboard">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
          aria-label="Customize dashboard"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Customize</span>
        </button>
      </Tooltip>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-surface-200">
              <h2 className="text-lg font-semibold text-surface-900">Customize Dashboard</h2>
              <Tooltip content="Close">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-surface-400 hover:text-surface-600 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm text-surface-600 mb-4">
                Drag to reorder widgets. Toggle visibility using the eye icon.
              </p>

              <div className="space-y-2">
                {localWidgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 bg-surface-50 rounded-lg border border-surface-200 cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${!widget.visible ? 'opacity-60' : ''}`}
                  >
                    <GripVertical className="w-4 h-4 text-surface-400" />
                    <span className="flex-1 text-sm font-medium text-surface-900">
                      {widget.title}
                    </span>
                    <Tooltip content={widget.visible ? 'Hide widget' : 'Show widget'}>
                      <button
                        onClick={() => handleToggleVisibility(widget.id)}
                        className={`p-1.5 rounded transition-colors ${
                          widget.visible
                            ? 'text-primary-600 hover:bg-primary-50'
                            : 'text-surface-400 hover:bg-surface-200'
                        }`}
                        aria-label={widget.visible ? 'Hide widget' : 'Show widget'}
                      >
                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-surface-200">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
              >
                Reset
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
