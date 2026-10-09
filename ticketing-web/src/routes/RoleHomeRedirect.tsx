import { Navigate } from 'react-router'
import { useAccountRole } from '@/hooks/useAccountRole'
import { ROUTE_PATHS } from './routePaths'

export function RoleHomeRedirect() {
  const access = useAccountRole()
  return <Navigate to={access?.homePath ?? ROUTE_PATHS.connect} replace />
}
