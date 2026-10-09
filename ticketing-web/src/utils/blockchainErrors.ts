import { isError } from 'ethers'
import { InvalidCheckInPassError } from '@/blockchain/checkInProof'
import {
  ContractNotConfiguredError,
  WalletUnavailableError,
  WrongNetworkError,
} from '@/blockchain/errors'
import { TARGET_NETWORK } from '@/blockchain/networks'
import { QrDecodeError } from './qrCode'

const USER_REJECTED_CODE = 4001
const REQUEST_PENDING_CODE = -32002

/** Revert strings from the Solidity contracts mapped to user-facing copy. */
const REVERT_MESSAGES: Record<string, string> = {
  'event does not exist': 'This event does not exist.',
  'not event organiser': 'Only the organiser of this event can do that.',
  'name required': 'Event name is required.',
  'facePrice must be > 0': 'Face price must be greater than 0.',
  'supply must be > 0': 'Supply must be greater than 0.',
  'perWalletCap must be > 0': 'Per-wallet cap must be greater than 0.',
  'sale is closed': 'Ticket sales for this event are closed.',
  'sold out': 'This event is sold out.',
  'per-wallet cap reached': 'You have reached the per-wallet purchase limit for this event.',
  'incorrect payment': 'The payment amount does not match the ticket price.',
  'payment to organiser failed': 'Payment to the organiser failed.',
  'not ticket owner': 'Only the ticket owner can do that.',
  'ticket already used': 'This ticket has already been used.',
  'price must be > 0': 'Resale price must be greater than 0.',
  'price above face value': "Resale price cannot exceed the ticket's face value.",
  'not listed': 'This ticket is not listed for resale.',
  'seller cannot buy own listing': 'You cannot buy your own listing.',
  'seller no longer owns ticket': 'The seller no longer owns this ticket.',
  'payment to seller failed': 'Payment to the seller failed.',
  'not seller': 'Only the seller can cancel this listing.',
  'invalid validator': 'Enter a valid validator wallet address.',
  'ticket does not exist': 'This ticket does not exist.',
  'not event validator': 'This wallet is not a validator for the ticket’s event.',
  'ticket transfers must use resale': 'Tickets can only change hands through the resale marketplace.',
}

const CUSTOM_ERROR_MESSAGES: Record<string, string> = {
  ERC721NonexistentToken: 'This ticket does not exist.',
}

function collectMessages(error: unknown, depth = 0): string[] {
  if (depth > 4 || typeof error !== 'object' || error === null) return []
  const record = error as Record<string, unknown>
  const own = ['reason', 'shortMessage', 'message']
    .map((key) => record[key])
    .filter((value): value is string => typeof value === 'string')
  const nested = ['error', 'info', 'data', 'cause'].flatMap((key) =>
    collectMessages(record[key], depth + 1),
  )
  return [...own, ...nested]
}

function findRevertMessage(error: unknown): string | null {
  const messages = collectMessages(error).join(' | ')
  const match = Object.keys(REVERT_MESSAGES).find((reason) => messages.includes(reason))
  return match ? REVERT_MESSAGES[match] : null
}

function getErrorCode(error: unknown): number | string | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const record = error as { code?: number | string; info?: { error?: { code?: number } } }
  return record.info?.error?.code ?? record.code
}

export function isUserRejectedError(error: unknown): boolean {
  return isError(error, 'ACTION_REJECTED') || getErrorCode(error) === USER_REJECTED_CODE
}

/** Turn any wallet / ethers / contract error into a short, human-readable message. */
export function getBlockchainErrorMessage(error: unknown): string {
  if (
    error instanceof WalletUnavailableError ||
    error instanceof WrongNetworkError ||
    error instanceof ContractNotConfiguredError ||
    error instanceof InvalidCheckInPassError ||
    error instanceof QrDecodeError
  ) {
    return error.message
  }

  if (isUserRejectedError(error)) return 'Request cancelled in MetaMask.'
  if (getErrorCode(error) === REQUEST_PENDING_CODE) {
    return 'MetaMask already has a pending request. Open MetaMask to continue.'
  }

  const revertMessage = findRevertMessage(error)
  if (revertMessage) return revertMessage

  if (isError(error, 'CALL_EXCEPTION')) {
    const customError = error.revert?.name
    if (customError && CUSTOM_ERROR_MESSAGES[customError]) return CUSTOM_ERROR_MESSAGES[customError]
    return 'The smart contract rejected this request.'
  }
  if (isError(error, 'INSUFFICIENT_FUNDS')) {
    return 'Insufficient ETH to cover the payment and gas.'
  }
  if (isError(error, 'BAD_DATA') && error.value === '0x') {
    return `No EventTicketing contract found on ${TARGET_NETWORK.name}. Restarted the Hardhat node? Run the deploy script again.`
  }
  if (isError(error, 'TRANSACTION_REPLACED')) {
    return error.cancelled ? 'The transaction was cancelled in the wallet.' : 'The transaction was replaced.'
  }
  if (isError(error, 'NETWORK_ERROR') || isError(error, 'SERVER_ERROR')) {
    return `Cannot reach ${TARGET_NETWORK.name}. Make sure the Hardhat node is running.`
  }

  const messages = collectMessages(error).join(' | ').toLowerCase()
  if (messages.includes('nonce too high') || messages.includes('nonce has already been used')) {
    return 'MetaMask’s nonce is out of sync with the Hardhat node. In MetaMask, open Settings → Developer tools → Delete activity and nonce data, then try again.'
  }
  if (messages.includes('failed to fetch') || messages.includes('could not coalesce')) {
    return `Cannot reach ${TARGET_NETWORK.name}. Make sure the Hardhat node is running.`
  }

  return 'Something went wrong while talking to the blockchain.'
}
