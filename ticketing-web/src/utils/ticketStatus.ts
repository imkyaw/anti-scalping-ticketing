import type { ListedTicket, Ticket, TicketStatus, TicketWithEvent } from '@/types/ticketing'
import { isSameAddress } from './formatters'

/** A listing is buyable only while the seller still holds an unused ticket. */
export function hasActiveListing(ticket: Ticket): boolean {
  return Boolean(ticket.listing && !ticket.isUsed && isSameAddress(ticket.listing.seller, ticket.owner))
}

export function isListedTicket(ticket: TicketWithEvent): ticket is ListedTicket {
  return hasActiveListing(ticket)
}

export function getTicketStatus(ticket: Ticket): TicketStatus {
  if (ticket.isUsed) return 'used'
  if (hasActiveListing(ticket)) return 'listed'
  return 'valid'
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  valid: 'Valid · Unused',
  listed: 'Listed for resale',
  used: 'Used · Checked in',
}
