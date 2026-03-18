import { Navigate } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import type { RolePermissions } from '../../contexts/RoleContext';

interface ProtectedRouteProps {
  permission: keyof RolePermissions;
  children: React.ReactNode;
}

/**
 * Yetkisi olmayan kullanıcıyı Dashboard'a yönlendirir.
 * URL ile doğrudan erişim engellenir.
 */
export default function ProtectedRoute({ permission, children }: ProtectedRouteProps) {
  const { hasPermission } = useRole();

  if (!hasPermission(permission)) {
    return <Navigate to="/" state={{ accessDenied: true }} replace />;
  }

  return <>{children}</>;
}
