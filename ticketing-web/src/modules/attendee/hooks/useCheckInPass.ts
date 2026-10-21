import { useCallback, useState } from 'react'
import { serializeCheckInPass, type CheckInPassPayload } from '@/blockchain/checkInProof'
import { createCheckInPass } from '@/services/checkInService'
import { getBlockchainErrorMessage, isUserRejectedError } from '@/utils/blockchainErrors'
import { generateQrDataUrl } from '@/utils/qrCode'

export interface SignedCheckInQr {
  pass: CheckInPassPayload
  qrDataUrl: string
}

type CheckInPassState =
  | { status: 'idle' }
  | { status: 'signing' }
  | { status: 'ready'; qr: SignedCheckInQr }
  | { status: 'error'; message: string }

/** Attendee flow: nonce + expiry → MetaMask signature → QR image. */
export function useCheckInPass(tokenId: bigint, eventId: bigint) {
  const [state, setState] = useState<CheckInPassState>({ status: 'idle' })

  const generate = useCallback(async () => {
    setState({ status: 'signing' })
    try {
      const pass = await createCheckInPass(tokenId, eventId)
      const qrDataUrl = await generateQrDataUrl(serializeCheckInPass(pass))
      setState({ status: 'ready', qr: { pass, qrDataUrl } })
    } catch (error) {
      console.error(error)
      setState({
        status: 'error',
        message: isUserRejectedError(error) ? 'Signature request cancelled.' : getBlockchainErrorMessage(error),
      })
    }
  }, [tokenId, eventId])

  const reset = useCallback(() => setState({ status: 'idle' }), [])

  return { state, generate, reset }
}
