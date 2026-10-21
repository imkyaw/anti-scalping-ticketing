import { Contract, type ContractRunner } from 'ethers'
import { CONTRACT_ADDRESSES, EVENT_TICKETING_ABI } from '@/contracts/addresses'
import { ContractNotConfiguredError } from './errors'
import { TARGET_NETWORK } from './networks'
import { assertTargetNetwork, getBrowserProvider, getSigner } from './provider'

export function getEventTicketingAddress(): string {
  const address = CONTRACT_ADDRESSES[TARGET_NETWORK.chainId]?.eventTicketing
  if (!address) throw new ContractNotConfiguredError()
  return address
}

export function hasEventTicketingDeployment(): boolean {
  return Boolean(CONTRACT_ADDRESSES[TARGET_NETWORK.chainId]?.eventTicketing)
}

function createEventTicketingContract(runner: ContractRunner): Contract {
  return new Contract(getEventTicketingAddress(), EVENT_TICKETING_ABI, runner)
}

/** Contract bound to the provider: use for view calls and log queries. */
export async function getReadContract(): Promise<Contract> {
  await assertTargetNetwork()
  return createEventTicketingContract(getBrowserProvider())
}

/** Contract bound to the MetaMask signer: use for transactions. */
export async function getWriteContract(): Promise<Contract> {
  return createEventTicketingContract(await getSigner())
}
