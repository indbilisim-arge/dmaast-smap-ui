import { useState } from 'react';
import { GripVertical, Eye, EyeOff, X, Save, RotateCcw, Settings } from 'lucide-react';
import Tooltip from './Tooltip';
import type { LayoutItem, LayoutItemType } from '../../types/pageLayout';

interface PageCustomizerProps {
  pageTitle: string;
  items: LayoutItem[];
  onSave: (items: LayoutItem[]) => void;
  onClose: () => void;
  onResetToRoleDefault: () => LayoutItem[];
}

const TYPE_LABELS: Record<LayoutItemType, string> = {
  kpi: 'KPIs',
  card: 'Cards & Panels',
  widget: 'Widgets',
};

function groupByType(items: LayoutItem[]): Record<LayoutItemType, LayoutItem[]> {
  return {
    kpi: items.filter((i) => i.type === 'kpi'),
    card: items.filter((i) => i.type === 'card'),
    widget: items.filter((i) => i.type === 'widget'),
  };
}

export default function PageCustomizer({
  pageTitle,
  items,
  onSave,
  onClose,
  onResetToRoleDefault,
}: PageCustomizerProps) {
  const [localItems, setLocalItems] = useState(items);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const grouped = groupByType(localItems);

  const handleToggleVisibility = (id: string) => {
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)),
    );
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string, type: LayoutItemType) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setLocalItems((prev) => {
      const typeItems = prev.filter((i) => i.type === type);
      const otherItems = prev.filter((i) => i.type !== type);
      const fromIndex = typeItems.findIndex((i) => i.id === draggedId);
      const toIndex = typeItems.findIndex((i) => i.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;

      const reordered = [...typeItems];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      const updatedTypeItems = reordered.map((item, index) => ({ ...item, order: index }));
      return [...otherItems, ...updatedTypeItems].sort((a, b) => a.order - b.order);
    });
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const handleSave = () => {
    onSave(localItems);
    onClose();
  };

  const renderGroup = (type: LayoutItemType, groupItems: LayoutItem[]) => {
    if (groupItems.length === 0) return null;

    return (
      <div key={type} className="mb-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">
          {TYPE_LABELS[type]}
        </h3>
        <div className="space-y-2">
          {groupItems.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id, type)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 bg-surface-50 rounded-lg border border-surface-200 cursor-move ${
                draggedId === item.id ? 'opacity-50' : ''
              } ${!item.visible ? 'opacity-60' : ''}`}
            >
              <GripVertical className="w-4 h-4 text-surface-400 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-surface-900">{item.title}</span>
              <Tooltip content={item.visible ? 'Hide' : 'Show'}>
                <button
                  onClick={() => handleToggleVisibility(item.id)}
                  className={`p-1.5 rounded transition-colors ${
                    item.visible
                      ? 'text-primary-600 hover:bg-primary-50'
                      : 'text-surface-400 hover:bg-surface-200'
                  }`}
                  aria-label={item.visible ? 'Hide item' : 'Show item'}
                >
                  {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-surface-200">
          <div>
            <h2 className="text-lg font-semibold text-surface-900">Customize Layout</h2>
            <p className="text-sm text-surface-500">{pageTitle}</p>
          </div>
          <Tooltip content="Close">
            <button
              onClick={onClose}
              className="p-2 text-surface-400 hover:text-surface-600 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm text-surface-600 mb-4">
            Select which KPIs and cards to display for your role. Drag to reorder within each group.
          </p>
          {renderGroup('kpi', grouped.kpi)}
          {renderGroup('card', grouped.card)}
          {renderGroup('widget', grouped.widget)}
        </div>

        <div className="flex items-center justify-between p-4 border-t border-surface-200">
          <button
            onClick={() => setLocalItems(onResetToRoleDefault())}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Role Default
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
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
  );
}

interface CustomizeButtonProps {
  onClick: () => void;
  className?: string;
}

export function CustomizeButton({ onClick, className = '' }: CustomizeButtonProps) {
  return (
    <Tooltip content="Customize KPIs and cards for this page">
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:bg-surface-100 rounded-lg transition-colors ${className}`}
        aria-label="Customize page layout"
      >
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Customize</span>
      </button>
    </Tooltip>
  );
}
