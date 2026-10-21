import {
  buildCheckInMessage,
  CHECK_IN_PASS_TYPE,
  CHECK_IN_PASS_VERSION,
  createCheckInNonce,
  recoverCheckInSigner,
  type CheckInPassPayload,
  type UnsignedCheckInPass,
} from '@/blockchain/checkInProof'
import { getEventTicketingAddress } from '@/blockchain/contracts'
import { TARGET_NETWORK } from '@/blockchain/networks'
import { getSigner } from '@/blockchain/provider'
import { appConfig } from '@/env/appConfig'
import type { TicketWithEvent } from '@/types/ticketing'
import { isSameAddress } from '@/utils/formatters'
import { fetchTicketWithEvent } from './ticketService'
import { isValidatorFor } from './validationService'

export function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * Attendee side: sign a short-lived pass with MetaMask (no gas).
 * Steps from the flow: generate nonce + expiry → request signature → payload for the QR.
 */
export async function createCheckInPass(tokenId: bigint, eventId: bigint): Promise<CheckInPassPayload> {
  const signer = await getSigner()
  const unsigned: UnsignedCheckInPass = {
    type: CHECK_IN_PASS_TYPE,
    version: CHECK_IN_PASS_VERSION,
    chainId: TARGET_NETWORK.chainId,
    contract: getEventTicketingAddress(),
    tokenId: tokenId.toString(),
    eventId: eventId.toString(),
    holder: await signer.getAddress(),
    nonce: createCheckInNonce(),
    expiresAt: nowInSeconds() + appConfig.checkInQrTtlSeconds,
  }
  const signature = await signer.signMessage(buildCheckInMessage(unsigned))
  return { ...unsigned, signature }
}

export type CheckInCheckId =
  | 'network'
  | 'signature'
  | 'expiry'
  | 'replay'
  | 'ownership'
  | 'event'
  | 'unused'
  | 'validator'

export interface CheckInCheck {
  id: CheckInCheckId
  label: string
  passed: boolean
  detail: string
}

/** Which failure to headline when several checks fail — on-chain facts first. */
const REJECTION_PRIORITY: CheckInCheckId[] = [
  'unused',
  'ownership',
  'event',
  'validator',
  'network',
  'signature',
  'expiry',
  'replay',
]

export interface CheckInVerification {
  pass: CheckInPassPayload
  ticket: TicketWithEvent | null
  checks: CheckInCheck[]
  isValid: boolean
  rejectionReason: string | null
}

interface VerifyCheckInOptions {
  validatorAddress: string
  usedNonces: readonly string[]
}

function recoverSignerSafely(pass: CheckInPassPayload): string | null {
  try {
    return recoverCheckInSigner(pass)
  } catch {
    return null
  }
}

async function fetchTicketSafely(tokenId: bigint): Promise<TicketWithEvent | null> {
  try {
    return await fetchTicketWithEvent(tokenId)
  } catch {
    return null
  }
}

/**
 * Gatekeeper side: verify signature + expiry off-chain, then read owner, event
 * and used status on-chain. Only a fully valid pass may be admitted.
 */
export async function verifyCheckInPass(
  pass: CheckInPassPayload,
  { validatorAddress, usedNonces }: VerifyCheckInOptions,
): Promise<CheckInVerification> {
  const isThisDeployment =
    pass.chainId === TARGET_NETWORK.chainId && isSameAddress(pass.contract, getEventTicketingAddress())
  const recoveredSigner = recoverSignerSafely(pass)
  const secondsLeft = pass.expiresAt - nowInSeconds()

  const ticket = isThisDeployment ? await fetchTicketSafely(BigInt(pass.tokenId)) : null
  // The QR's event ID is only a claim; ticketEventId on-chain is the source of truth.
  const isEventMatch = Boolean(ticket && ticket.eventId.toString() === pass.eventId)
  const isValidator = ticket ? await isValidatorFor(ticket.eventId, validatorAddress) : false

  const checks: CheckInCheck[] = [
    {
      id: 'network',
      label: 'Issued for this contract',
      passed: isThisDeployment,
      detail: isThisDeployment
        ? `${TARGET_NETWORK.name} · EventTicketing`
        : 'Pass was issued for a different network or contract.',
    },
    {
      id: 'signature',
      label: 'Holder signature is valid',
      passed: isSameAddress(recoveredSigner, pass.holder),
      detail: isSameAddress(recoveredSigner, pass.holder)
        ? 'Signed by the wallet named in the pass.'
        : 'Signature does not match the holder — the pass was forged or altered.',
    },
    {
      id: 'expiry',
      label: 'Pass has not expired',
      passed: secondsLeft > 0,
      detail: secondsLeft > 0 ? `Valid for ${secondsLeft}s more.` : 'Ask the attendee to generate a fresh QR.',
    },
    {
      id: 'replay',
      label: 'QR not scanned before',
      passed: !usedNonces.includes(pass.nonce),
      detail: usedNonces.includes(pass.nonce)
        ? 'This exact QR was already scanned at this gate.'
        : 'First scan of this pass.',
    },
    {
      id: 'ownership',
      label: 'Holder owns the ticket on-chain',
      passed: Boolean(ticket && isSameAddress(ticket.owner, pass.holder)),
      detail: !ticket
        ? 'Ticket does not exist on-chain.'
        : isSameAddress(ticket.owner, pass.holder)
          ? 'ownerOf(ticket) matches the signer.'
          : 'The ticket now belongs to another wallet.',
    },
    {
      id: 'event',
      label: 'Ticket belongs to the pass event',
      passed: isEventMatch,
      detail: !ticket
        ? 'Cannot confirm the event of a ticket that does not exist.'
        : isEventMatch
          ? `ticketEventId(ticket) = ${pass.eventId}, as stated in the pass.`
          : `Pass claims event ${pass.eventId}, but the ticket belongs to event ${ticket.eventId}.`,
    },
    {
      id: 'unused',
      label: 'Ticket has not been used',
      passed: Boolean(ticket && !ticket.isUsed),
      detail: ticket?.isUsed ? 'Duplicate entry attempt — already marked used.' : 'isUsed = false',
    },
    {
      id: 'validator',
      label: 'You may validate this event',
      passed: isValidator,
      detail: isValidator
        ? 'Your wallet holds the validator role for this event.'
        : 'Your wallet is not a validator for this ticket’s event.',
    },
  ]

  const primaryFailure = REJECTION_PRIORITY.map((id) => checks.find((check) => check.id === id)).find(
    (check) => check && !check.passed,
  )
  return {
    pass,
    ticket,
    checks,
    isValid: !primaryFailure,
    rejectionReason: primaryFailure ? primaryFailure.detail : null,
  }
}
