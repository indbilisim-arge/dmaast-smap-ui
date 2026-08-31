import type { UserRole } from '../contexts/RoleContext';

export type PageId =
  | 'dashboard'
  | 'value-chain'
  | 'manufacturing'
  | 'logistics'
  | 'product'
  | 'sustainability'
  | 'value-chain-sim'
  | 'manufacturing-sim'
  | 'mo-dss'
  | 'scheduling';

export type LayoutItemType = 'kpi' | 'card' | 'widget';

/**
 * Bir kartin hangi use case'e ait oldugu — Işıl karari 2026-08-30:
 * "kartlar ve icerik data ayni olmak zorunda degil, farkli olmasini bekliyoruz zaten".
 *
 * 'both' = iki arayuzde de var (varsayilan)
 * 'kam'  = yalnizca KAM arayuzunde (or. Efficiency Factor — IFS'e ozgu)
 * 'jpb'  = yalnizca JPB arayuzunde (or. Cycle Time Analysis — gerceklesen sure yalnız JPB'de)
 */
export type CardScope = 'both' | 'kam' | 'jpb';

export interface LayoutItemDefinition {
  id: string;
  title: string;
  type: LayoutItemType;
  /** Belirtilmezse 'both' kabul edilir */
  scope?: CardScope;
}

export interface LayoutItem extends LayoutItemDefinition {
  visible: boolean;
  order: number;
}

export interface PageLayoutConfig {
  pageId: PageId;
  label: string;
  items: LayoutItemDefinition[];
  roleDefaults: Record<UserRole, string[]>;
}

export type PageLayoutState = Record<PageId, LayoutItem[]>;
