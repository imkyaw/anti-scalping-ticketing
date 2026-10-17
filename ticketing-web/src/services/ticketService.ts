import { EventLog, type Contract, type ContractTransactionResponse, type Log } from 'ethers'
import { getReadContract, getWriteContract } from '@/blockchain/contracts'
import { getBrowserProvider } from '@/blockchain/provider'
import type {
  Ticket,
  TicketHistoryEntry,
  TicketHistoryKind,
  TicketingEvent,
  TicketWithEvent,
} from '@/types/ticketing'
import { fetchEvent } from './eventService'

async function readTicket(contract: Contract, tokenId: bigint): Promise<Ticket> {
  const [owner, eventId, facePrice, isUsed, [seller, price]] = await Promise.all([
    contract.ownerOf(tokenId),
    contract.ticketEventId(tokenId),
    contract.ticketFacePrice(tokenId),
    contract.isUsed(tokenId),
    contract.getListing(tokenId),
  ])
  return {
    tokenId,
    eventId,
    owner,
    facePrice,
    isUsed,
    listing: price > 0n ? { seller, price } : null,
  }
}

export async function fetchTicket(tokenId: bigint): Promise<Ticket> {
  return readTicket(await getReadContract(), tokenId)
}

export async function fetchTicketsOf(account: string): Promise<Ticket[]> {
  const contract = await getReadContract()
  const tokenIds: bigint[] = await contract.ticketsOf(account)
  return Promise.all(tokenIds.map((tokenId) => readTicket(contract, tokenId)))
}

/** Token IDs are sequential from 1, and tickets are never burned. */
export async function fetchAllTickets(): Promise<Ticket[]> {
  const contract = await getReadContract()
  const nextTokenId: bigint = await contract.nextTokenId()
  const tokenIds = Array.from({ length: Number(nextTokenId - 1n) }, (_, index) => BigInt(index + 1))
  return Promise.all(tokenIds.map((tokenId) => readTicket(contract, tokenId)))
}

/** Attach event details, fetching each distinct event only once. */
export async function attachEvents(tickets: Ticket[]): Promise<TicketWithEvent[]> {
  const eventIds = [...new Set(tickets.map((ticket) => ticket.eventId))]
  const events = await Promise.all(eventIds.map(fetchEvent))
  const eventsById = new Map<bigint, TicketingEvent>(events.map((event) => [event.eventId, event]))
  return tickets.map((ticket) => ({ ...ticket, event: eventsById.get(ticket.eventId)! }))
}

export async function fetchTicketWithEvent(tokenId: bigint): Promise<TicketWithEvent> {
  const ticket = await fetchTicket(tokenId)
  return { ...ticket, event: await fetchEvent(ticket.eventId) }
}

export async function buyTicket(
  eventId: bigint,
  facePrice: bigint,
): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.buyTicket(eventId, { value: facePrice })
}

function toHistoryEntry(kind: TicketHistoryKind, log: EventLog): Omit<TicketHistoryEntry, 'timestamp'> {
  const base = { kind, blockNumber: log.blockNumber, txHash: log.transactionHash }
  switch (kind) {
    case 'purchased':
      return { ...base, actor: log.args.buyer, counterparty: null, price: log.args.price }
    case 'listed':
      return { ...base, actor: log.args.seller, counterparty: null, price: log.args.price }
    case 'resold':
      return { ...base, actor: log.args.buyer, counterparty: log.args.seller, price: log.args.price }
    case 'used':
      return { ...base, actor: log.args.validator, counterparty: log.args.ticketOwner, price: null }
  }
}

function onlyEventLogs(logs: Array<EventLog | Log>): EventLog[] {
  return logs.filter((log): log is EventLog => log instanceof EventLog)
}

/** Build a provenance timeline for one ticket from contract event logs. */
export async function fetchTicketHistory(tokenId: bigint): Promise<TicketHistoryEntry[]> {
  const contract = await getReadContract()
  const { filters } = contract

  const [purchased, listed, resold, used] = await Promise.all([
    contract.queryFilter(filters.TicketPurchased(null, tokenId)),
    contract.queryFilter(filters.TicketListedForResale(tokenId)),
    contract.queryFilter(filters.TicketResold(tokenId)),
    contract.queryFilter(filters.TicketUsed(tokenId)),
  ])

  const entries = [
    ...onlyEventLogs(purchased).map((log) => toHistoryEntry('purchased', log)),
    ...onlyEventLogs(listed).map((log) => toHistoryEntry('listed', log)),
    ...onlyEventLogs(resold).map((log) => toHistoryEntry('resold', log)),
    ...onlyEventLogs(used).map((log) => toHistoryEntry('used', log)),
  ].sort((a, b) => a.blockNumber - b.blockNumber)

  const provider = getBrowserProvider()
  const blockNumbers = [...new Set(entries.map((entry) => entry.blockNumber))]
  const blocks = await Promise.all(blockNumbers.map((blockNumber) => provider.getBlock(blockNumber)))
  const timestamps = new Map(blocks.map((block, index) => [blockNumbers[index], block?.timestamp ?? null]))

  return entries.map((entry) => ({ ...entry, timestamp: timestamps.get(entry.blockNumber) ?? null }))
}
