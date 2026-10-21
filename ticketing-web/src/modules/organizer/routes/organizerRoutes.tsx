import type { RouteObject } from 'react-router'
import { RequireArea } from '@/routes/RequireArea'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { CreateEventPage } from '../pages/CreateEventPage'
import { ManageEventPage } from '../pages/ManageEventPage'
import { OrganizerDashboardPage } from '../pages/OrganizerDashboardPage'

export const organizerRoutes: RouteObject[] = [
  {
    element: <RequireArea area="organizer" />,
    children: [
      { path: ROUTE_PATHS.organizerDashboard, element: <OrganizerDashboardPage /> },
      { path: ROUTE_PATHS.createEvent, element: <CreateEventPage /> },
      { path: ROUTE_PATHS.manageEvent(':eventId'), element: <ManageEventPage /> },
    ],
  },
]
