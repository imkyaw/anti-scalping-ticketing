import { createBrowserRouter, RouterProvider } from 'react-router'
import { AppShell } from '@/components/layout/AppShell'
import { attendeeRoutes } from '@/modules/attendee/routes/attendeeRoutes'
import { gatekeeperRoutes } from '@/modules/gatekeeper/routes/gatekeeperRoutes'
import { organizerRoutes } from '@/modules/organizer/routes/organizerRoutes'
import { ConnectWalletPage } from '@/pages/connectWallet/ConnectWalletPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RequireAssignedRole } from './RequireAssignedRole'
import { RequireWallet } from './RequireWallet'
import { RoleHomeRedirect } from './RoleHomeRedirect'
import { ROUTE_PATHS } from './routePaths'

const router = createBrowserRouter([
  { path: ROUTE_PATHS.connect, element: <ConnectWalletPage /> },
  {
    element: <RequireWallet />,
    children: [
      {
        // Tabs and sections per wallet come from config/accountRoles.ts.
        element: <RequireAssignedRole />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, path: '/', element: <RoleHomeRedirect /> },
              ...attendeeRoutes,
              ...organizerRoutes,
              ...gatekeeperRoutes,
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
