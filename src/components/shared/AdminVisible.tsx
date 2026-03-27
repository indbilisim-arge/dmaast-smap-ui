import type { ReactNode } from 'react';
import { useComponentVisibility } from '../../contexts/ComponentVisibilityContext';
import { useRole } from '../../contexts/RoleContext';

interface AdminVisibleProps {
  /** The component registry ID, e.g. 'dashboard.quick-stats' */
  id: string;
  children: ReactNode;
  /** Optional fallback when hidden */
  fallback?: ReactNode;
}

/**
 * Wrapper that conditionally renders children based on admin visibility settings
 * for the current role. If no admin setting exists, the component is shown by default.
 */
export default function AdminVisible({ id, children, fallback = null }: AdminVisibleProps) {
  const { isVisible } = useComponentVisibility();
  const { role } = useRole();

  if (!isVisible(id, role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
