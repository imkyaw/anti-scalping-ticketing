/** Domain models mapped from the EventTicketing contract. */

export interface TicketingEvent {
  eventId: bigint
  name: string
  organiser: string
  facePrice: bigint
  supply: bigint
  sold: bigint
  perWalletCap: bigint
  saleOpen: boolean
}

export interface ResaleListing {
  seller: string
  price: bigint
}

export interface Ticket {
  tokenId: bigint
  eventId: bigint
  owner: string
  facePrice: bigint
  isUsed: boolean
  /** Raw on-chain listing, or null when the ticket has never been listed / was cleared. */
  listing: ResaleListing | null
}

export interface TicketWithEvent extends Ticket {
  event: TicketingEvent
}

/** A ticket with an active resale listing. */
export interface ListedTicket extends TicketWithEvent {
  listing: ResaleListing
}

export type TicketStatus = 'valid' | 'listed' | 'used'

export type TicketHistoryKind = 'purchased' | 'listed' | 'resold' | 'used'

export interface TicketHistoryEntry {
  kind: TicketHistoryKind
  blockNumber: number
  timestamp: number | null
  txHash: string
  /** Buyer, seller or validator depending on the entry kind. */
  actor: string
  counterparty: string | null
  price: bigint | null
}

export interface ValidatorGrant {
  validator: string
  blockNumber: number
  txHash: string
}

export interface CreateEventInput {
  name: string
  facePrice: bigint
  supply: bigint
  perWalletCap: bigint
}
