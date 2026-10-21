import { Navigate, Outlet } from 'react-router'
import type { AppArea } from '@/config/accountRoles'
import { useAccountRole } from '@/hooks/useAccountRole'

/** Only render this section if the wallet's role includes it; otherwise go to the role's home. */
export function RequireArea({ area }: { area: AppArea }) {
  const access = useAccountRole()
  if (!access) return <Navigate to="/" replace />
  if (!access.canAccess(area)) return <Navigate to={access.homePath} replace />
  return <Outlet />
}
