import type { ContractTransactionResponse, TransactionReceipt } from 'ethers'
import { getReadContract, getWriteContract } from '@/blockchain/contracts'
import type { CreateEventInput, TicketingEvent } from '@/types/ticketing'
import { isSameAddress } from '@/utils/formatters'

async function readEvent(eventId: bigint): Promise<TicketingEvent> {
  const contract = await getReadContract()
  const [name, organiser, facePrice, supply, sold, perWalletCap, saleOpen] =
    await contract.getEventInfo(eventId)
  return { eventId, name, organiser, facePrice, supply, sold, perWalletCap, saleOpen }
}

export function fetchEvent(eventId: bigint): Promise<TicketingEvent> {
  return readEvent(eventId)
}

/** Event IDs are sequential and start at 1. */
export async function fetchAllEvents(): Promise<TicketingEvent[]> {
  const contract = await getReadContract()
  const nextEventId: bigint = await contract.nextEventId()
  const eventIds = Array.from({ length: Number(nextEventId - 1n) }, (_, index) => BigInt(index + 1))
  return Promise.all(eventIds.map(readEvent))
}

export async function fetchEventsByOrganiser(organiser: string): Promise<TicketingEvent[]> {
  const events = await fetchAllEvents()
  return events.filter((event) => isSameAddress(event.organiser, organiser))
}

export async function fetchPurchasedCount(eventId: bigint, account: string): Promise<bigint> {
  const contract = await getReadContract()
  return contract.purchasedCount(eventId, account)
}

export async function createEvent(input: CreateEventInput): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.createEvent(input.name, input.facePrice, input.supply, input.perWalletCap)
}

export async function openSale(eventId: bigint): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.openSale(eventId)
}

export async function closeSale(eventId: bigint): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.closeSale(eventId)
}

/** Read the new event ID from the EventCreated log in a createEvent receipt. */
export async function getCreatedEventId(receipt: TransactionReceipt): Promise<bigint | null> {
  const contract = await getReadContract()
  for (const log of receipt.logs) {
    const parsed = contract.interface.parseLog(log)
    if (parsed?.name === 'EventCreated') return parsed.args.eventId as bigint
  }
  return null
}
