import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRole } from '../contexts/RoleContext';
import {
  getRoleDefaultLayout,
  getStorageKey,
  PAGE_LAYOUTS,
} from '../data/pageLayouts';
import type { LayoutItem, PageId } from '../types/pageLayout';

function loadLayout(pageId: PageId, role: ReturnType<typeof useRole>['role']): LayoutItem[] {
  const storageKey = getStorageKey(pageId, role);
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as LayoutItem[];
      const definitions = PAGE_LAYOUTS[pageId].items;
      const definitionIds = new Set(definitions.map((d) => d.id));

      const validItems = parsed.filter((item) => definitionIds.has(item.id));
      const savedIds = new Set(validItems.map((item) => item.id));
      const missing = definitions
        .filter((d) => !savedIds.has(d.id))
        .map((d, i) => ({
          ...d,
          visible: false,
          order: validItems.length + i,
        }));

      return [...validItems, ...missing].sort((a, b) => a.order - b.order);
    } catch {
      return getRoleDefaultLayout(pageId, role);
    }
  }
  return getRoleDefaultLayout(pageId, role);
}

export function usePageLayout(pageId: PageId) {
  const { role } = useRole();
  const [items, setItems] = useState<LayoutItem[]>(() => loadLayout(pageId, role));
  const [showCustomizer, setShowCustomizer] = useState(false);

  useEffect(() => {
    setItems(loadLayout(pageId, role));
  }, [pageId, role]);

  const saveLayout = useCallback(
    (newItems: LayoutItem[]) => {
      const normalized = newItems.map((item, index) => ({ ...item, order: index }));
      setItems(normalized);
      localStorage.setItem(getStorageKey(pageId, role), JSON.stringify(normalized));
    },
    [pageId, role],
  );

  const resetToRoleDefault = useCallback((): LayoutItem[] => {
    const defaults = getRoleDefaultLayout(pageId, role);
    saveLayout(defaults);
    return defaults;
  }, [pageId, role, saveLayout]);

  const isVisible = useCallback(
    (id: string) => items.find((item) => item.id === id)?.visible ?? false,
    [items],
  );

  const visibleItems = useMemo(
    () => items.filter((item) => item.visible).sort((a, b) => a.order - b.order),
    [items],
  );

  const visibleKpiItems = useMemo(
    () => visibleItems.filter((item) => item.type === 'kpi'),
    [visibleItems],
  );

  const visibleCardItems = useMemo(
    () => visibleItems.filter((item) => item.type === 'card'),
    [visibleItems],
  );

  const visibleWidgetItems = useMemo(
    () => visibleItems.filter((item) => item.type === 'widget'),
    [visibleItems],
  );

  return {
    items,
    visibleItems,
    visibleKpiItems,
    visibleCardItems,
    visibleWidgetItems,
    isVisible,
    saveLayout,
    resetToRoleDefault,
    showCustomizer,
    setShowCustomizer,
    pageLabel: PAGE_LAYOUTS[pageId].label,
  };
}
