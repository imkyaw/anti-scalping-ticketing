import type { ContractTransactionResponse } from 'ethers'
import { getWriteContract } from '@/blockchain/contracts'
import type { ListedTicket } from '@/types/ticketing'
import { hasActiveListing, isListedTicket } from '@/utils/ticketStatus'
import { attachEvents, fetchAllTickets } from './ticketService'

/**
 * The contract has no listing index, so scan every ticket.
 * Fine for the local proof-of-concept dataset.
 */
export async function fetchActiveListings(): Promise<ListedTicket[]> {
  const tickets = await fetchAllTickets()
  const withEvents = await attachEvents(tickets.filter(hasActiveListing))
  return withEvents.filter(isListedTicket)
}

export async function listForResale(
  tokenId: bigint,
  price: bigint,
): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.listForResale(tokenId, price)
}

export async function buyResale(tokenId: bigint, price: bigint): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.buyResale(tokenId, { value: price })
}

export async function cancelResale(tokenId: bigint): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.cancelResale(tokenId)
}
