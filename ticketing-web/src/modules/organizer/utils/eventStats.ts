import type { Ticket, TicketingEvent } from '@/types/ticketing'
import { hasActiveListing } from '@/utils/ticketStatus'

export interface EventStats {
  sold: bigint
  checkedIn: bigint
  /** Sold tickets not yet used at the gate. */
  inWallets: bigint
  unsold: bigint
  activeListings: number
  /** Primary-sale revenue paid to the organiser (sold × face price). */
  primaryRevenue: bigint
}

export function computeEventStats(event: TicketingEvent, allTickets: Ticket[]): EventStats {
  const tickets = allTickets.filter((ticket) => ticket.eventId === event.eventId)
  const checkedIn = BigInt(tickets.filter((ticket) => ticket.isUsed).length)

  return {
    sold: event.sold,
    checkedIn,
    inWallets: event.sold - checkedIn,
    unsold: event.supply - event.sold,
    activeListings: tickets.filter(hasActiveListing).length,
    primaryRevenue: event.sold * event.facePrice,
  }
}
