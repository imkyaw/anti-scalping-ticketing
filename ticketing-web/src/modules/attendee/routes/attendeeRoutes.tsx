import type { RouteObject } from 'react-router'
import { RequireArea } from '@/routes/RequireArea'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { EventPurchasePage } from '../pages/EventPurchasePage'
import { EventsPage } from '../pages/EventsPage'
import { ListTicketForResalePage } from '../pages/ListTicketForResalePage'
import { MyTicketsPage } from '../pages/MyTicketsPage'
import { ResaleMarketplacePage } from '../pages/ResaleMarketplacePage'
import { TicketDetailsPage } from '../pages/TicketDetailsPage'

export const attendeeRoutes: RouteObject[] = [
  {
    element: <RequireArea area="events" />,
    children: [
      { path: ROUTE_PATHS.events, element: <EventsPage /> },
      { path: ROUTE_PATHS.eventDetails(':eventId'), element: <EventPurchasePage /> },
    ],
  },
  {
    element: <RequireArea area="marketplace" />,
    children: [
      { path: ROUTE_PATHS.marketplace, element: <ResaleMarketplacePage /> },
      { path: ROUTE_PATHS.listForResale(), element: <ListTicketForResalePage /> },
    ],
  },
  {
    element: <RequireArea area="myTickets" />,
    children: [
      { path: ROUTE_PATHS.myTickets, element: <MyTicketsPage /> },
      { path: ROUTE_PATHS.ticketDetails(':tokenId'), element: <TicketDetailsPage /> },
    ],
  },
]
