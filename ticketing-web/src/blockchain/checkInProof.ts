import { getAddress, hexlify, isAddress, randomBytes, verifyMessage } from 'ethers'

export const CHECK_IN_PASS_TYPE = 'fairticket-check-in'
export const CHECK_IN_PASS_VERSION = 2

/** Data encoded in the attendee's check-in QR code. */
export interface CheckInPassPayload {
  type: typeof CHECK_IN_PASS_TYPE
  version: typeof CHECK_IN_PASS_VERSION
  chainId: number
  contract: string
  tokenId: string
  /** Event the attendee claims the ticket belongs to; the gatekeeper confirms it on-chain. */
  eventId: string
  holder: string
  nonce: string
  /** Unix timestamp in seconds. */
  expiresAt: number
  signature: string
}

export type UnsignedCheckInPass = Omit<CheckInPassPayload, 'signature'>

export class InvalidCheckInPassError extends Error {
  constructor(message = 'This QR code is not a FairTicket check-in pass.') {
    super(message)
    this.name = 'InvalidCheckInPassError'
  }
}

export function createCheckInNonce(): string {
  return hexlify(randomBytes(16))
}

/**
 * Human-readable message the attendee signs in MetaMask (personal_sign).
 * The gatekeeper rebuilds the exact same text to recover the signer.
 */
export function buildCheckInMessage(pass: UnsignedCheckInPass): string {
  return [
    'FairTicket check-in pass',
    '',
    `Event ID: ${pass.eventId}`,
    `Ticket ID: ${pass.tokenId}`,
    `Holder: ${pass.holder}`,
    `Contract: ${pass.contract}`,
    `Chain ID: ${pass.chainId}`,
    `Nonce: ${pass.nonce}`,
    `Expires at: ${new Date(pass.expiresAt * 1000).toISOString()}`,
    '',
    'Signing proves you hold this ticket. It does not send a transaction or cost gas.',
  ].join('\n')
}

export function recoverCheckInSigner(pass: CheckInPassPayload): string {
  const { signature, ...unsigned } = pass
  return verifyMessage(buildCheckInMessage(unsigned), signature)
}

export function serializeCheckInPass(pass: CheckInPassPayload): string {
  return JSON.stringify(pass)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function parseCheckInPass(raw: string): CheckInPassPayload {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new InvalidCheckInPassError()
  }

  if (!isRecord(parsed) || parsed.type !== CHECK_IN_PASS_TYPE) {
    throw new InvalidCheckInPassError()
  }
  if (parsed.version !== CHECK_IN_PASS_VERSION) {
    throw new InvalidCheckInPassError('This check-in pass uses an older format. Ask the attendee to generate a fresh QR.')
  }

  const { chainId, contract, tokenId, eventId, holder, nonce, expiresAt, signature } = parsed
  const isWellFormed =
    typeof chainId === 'number' &&
    typeof contract === 'string' &&
    isAddress(contract) &&
    typeof tokenId === 'string' &&
    /^\d+$/.test(tokenId) &&
    typeof eventId === 'string' &&
    /^\d+$/.test(eventId) &&
    typeof holder === 'string' &&
    isAddress(holder) &&
    typeof nonce === 'string' &&
    typeof expiresAt === 'number' &&
    typeof signature === 'string'

  if (!isWellFormed) throw new InvalidCheckInPassError('This check-in pass is incomplete or corrupted.')

  return {
    type: CHECK_IN_PASS_TYPE,
    version: CHECK_IN_PASS_VERSION,
    chainId,
    contract: getAddress(contract),
    tokenId,
    eventId,
    holder: getAddress(holder),
    nonce,
    expiresAt,
    signature,
  }
}
