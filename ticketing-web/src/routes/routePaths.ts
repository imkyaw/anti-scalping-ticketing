/** Single source of truth for URLs used by links and navigation. */
export const ROUTE_PATHS = {
  connect: '/connect',
  events: '/events',
  eventDetails: (eventId: bigint | string) => `/events/${eventId}`,
  myTickets: '/tickets',
  ticketDetails: (tokenId: bigint | string) => `/tickets/${tokenId}`,
  marketplace: '/marketplace',
  listForResale: (tokenId?: bigint | string) =>
    tokenId === undefined ? '/marketplace/list' : `/marketplace/list?tokenId=${tokenId}`,
  organizerDashboard: '/organizer',
  createEvent: '/organizer/events/new',
  manageEvent: (eventId: bigint | string) => `/organizer/events/${eventId}`,
  gatekeeper: '/gatekeeper',
} as const

/** Parse a numeric route param into a bigint ID, or null when invalid. */
export function parseIdParam(value: string | null | undefined): bigint | null {
  return value && /^\d+$/.test(value) && value !== '0' ? BigInt(value) : null
}
