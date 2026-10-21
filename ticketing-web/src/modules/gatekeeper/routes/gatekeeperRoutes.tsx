import type { RouteObject } from 'react-router'
import { RequireArea } from '@/routes/RequireArea'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { TicketValidatorPage } from '../pages/TicketValidatorPage'

export const gatekeeperRoutes: RouteObject[] = [
  {
    element: <RequireArea area="gatekeeper" />,
    children: [{ path: ROUTE_PATHS.gatekeeper, element: <TicketValidatorPage /> }],
  },
]
