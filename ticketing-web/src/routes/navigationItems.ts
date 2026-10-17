import type { AppArea } from '@/config/accountRoles'
import { ROUTE_PATHS } from './routePaths'

export interface NavigationItem {
  area: AppArea
  label: string
  to: string
}

export const AREA_NAVIGATION: Record<AppArea, NavigationItem> = {
  events: { area: 'events', label: 'Events', to: ROUTE_PATHS.events },
  marketplace: { area: 'marketplace', label: 'Marketplace', to: ROUTE_PATHS.marketplace },
  myTickets: { area: 'myTickets', label: 'My Tickets', to: ROUTE_PATHS.myTickets },
  organizer: { area: 'organizer', label: 'Organizer', to: ROUTE_PATHS.organizerDashboard },
  gatekeeper: { area: 'gatekeeper', label: 'Gatekeeper', to: ROUTE_PATHS.gatekeeper },
}
