import { useCallback, useState } from 'react'
import { parseCheckInPass } from '@/blockchain/checkInProof'
import { useTransaction } from '@/hooks/useTransaction'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { nowInSeconds, verifyCheckInPass, type CheckInVerification } from '@/services/checkInService'
import { markTicketUsed } from '@/services/validationService'
import { getBlockchainErrorMessage } from '@/utils/blockchainErrors'
import { decodeQrFromImageFile } from '@/utils/qrCode'
import { checkInRecorded, passScanned, type CheckInOutcome } from '../redux/checkInSlice'

export type VerificationState =
  | { status: 'idle' }
  | { status: 'verifying'; fileName: string }
  | { status: 'failed'; message: string }
  | { status: 'verified'; verification: CheckInVerification }
  | { status: 'admitted'; verification: CheckInVerification; txHash: string }

/**
 * Gatekeeper flow: decode uploaded QR → verify signature & expiry → read
 * owner / event / used status on-chain → admit with markUsed (or reject).
 */
export function useCheckInVerification(validatorAddress: string) {
  const dispatch = useAppDispatch()
  const scannedNonces = useAppSelector((state) => state.gatekeeperCheckIn.scannedNonces)
  const admitTransaction = useTransaction()
  const { execute: executeAdmit, reset: resetAdmit } = admitTransaction
  const [state, setState] = useState<VerificationState>({ status: 'idle' })

  const record = useCallback(
    (verification: CheckInVerification, outcome: CheckInOutcome, reason: string | null, txHash: string | null) => {
      dispatch(
        checkInRecorded({
          id: `${verification.pass.nonce}-${outcome}`,
          tokenId: verification.pass.tokenId,
          eventName: verification.ticket?.event.name ?? null,
          holder: verification.pass.holder,
          outcome,
          reason,
          txHash,
          recordedAt: Date.now(),
        }),
      )
    },
    [dispatch],
  )

  const verifyFile = useCallback(
    async (file: File) => {
      resetAdmit()
      setState({ status: 'verifying', fileName: file.name })
      try {
        const pass = parseCheckInPass(await decodeQrFromImageFile(file))
        const verification = await verifyCheckInPass(pass, { validatorAddress, usedNonces: scannedNonces })
        // Each QR may be scanned once, whatever the outcome.
        dispatch(passScanned(pass.nonce))
        if (!verification.isValid) record(verification, 'rejected', verification.rejectionReason, null)
        setState({ status: 'verified', verification })
      } catch (error) {
        console.error(error)
        setState({ status: 'failed', message: getBlockchainErrorMessage(error) })
      }
    },
    [dispatch, record, resetAdmit, scannedNonces, validatorAddress],
  )

  const admit = useCallback(async () => {
    if (state.status !== 'verified' || !state.verification.isValid) return
    const { verification } = state
    if (verification.pass.expiresAt <= nowInSeconds()) return

    const result = await executeAdmit(() => markTicketUsed(BigInt(verification.pass.tokenId)))
    if (result.ok) {
      record(verification, 'admitted', null, result.receipt.hash)
      setState({ status: 'admitted', verification, txHash: result.receipt.hash })
    }
  }, [executeAdmit, record, state])

  const reject = useCallback(() => {
    if (state.status === 'verified') record(state.verification, 'rejected', 'Entry refused by gate staff.', null)
    resetAdmit()
    setState({ status: 'idle' })
  }, [record, resetAdmit, state])

  const reset = useCallback(() => {
    resetAdmit()
    setState({ status: 'idle' })
  }, [resetAdmit])

  return { state, admitTransaction, verifyFile, admit, reject, reset }
}
