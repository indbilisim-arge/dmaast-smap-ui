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

export interface LayoutItemDefinition {
  id: string;
  title: string;
  type: LayoutItemType;
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
