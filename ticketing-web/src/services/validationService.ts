import { EventLog, type ContractTransactionResponse } from 'ethers'
import { getReadContract, getWriteContract } from '@/blockchain/contracts'
import type { TicketingEvent, ValidatorGrant } from '@/types/ticketing'
import { fetchAllEvents } from './eventService'

export async function isValidatorFor(eventId: bigint, account: string): Promise<boolean> {
  const contract = await getReadContract()
  return contract.isValidator(eventId, account)
}

export async function fetchValidatorEvents(account: string): Promise<TicketingEvent[]> {
  const events = await fetchAllEvents()
  const flags = await Promise.all(events.map((event) => isValidatorFor(event.eventId, account)))
  return events.filter((_, index) => flags[index])
}

/** Validators granted for one event, read from ValidatorGranted logs (the contract has no revoke). */
export async function fetchEventValidators(eventId: bigint): Promise<ValidatorGrant[]> {
  const contract = await getReadContract()
  const logs = await contract.queryFilter(contract.filters.ValidatorGranted(eventId))
  const grants = new Map<string, ValidatorGrant>()

  for (const log of logs) {
    if (!(log instanceof EventLog)) continue
    const validator: string = log.args.validator
    if (!grants.has(validator.toLowerCase())) {
      grants.set(validator.toLowerCase(), {
        validator,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
      })
    }
  }
  return [...grants.values()]
}

export async function grantValidator(
  eventId: bigint,
  validator: string,
): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.grantValidator(eventId, validator)
}

export async function markTicketUsed(tokenId: bigint): Promise<ContractTransactionResponse> {
  const contract = await getWriteContract()
  return contract.markUsed(tokenId)
}
