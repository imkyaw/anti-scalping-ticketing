import type { ContractTransactionResponse, TransactionReceipt } from 'ethers'
import { useCallback, useRef, useState } from 'react'
import { useAppDispatch } from '@/redux/hooks'
import { refreshBalance } from '@/redux/slices/walletSlice'
import { getBlockchainErrorMessage, isUserRejectedError } from '@/utils/blockchainErrors'

export type TransactionStatus =
  | 'idle'
  | 'awaitingSignature'
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'failed'

export interface TransactionState {
  status: TransactionStatus
  hash: string | null
  error: string | null
}

export type TransactionResult =
  | { ok: true; receipt: TransactionReceipt }
  | { ok: false; status: 'busy' | 'cancelled' | 'failed'; error: string | null }

const IDLE_STATE: TransactionState = { status: 'idle', hash: null, error: null }

/**
 * Drive one contract write: wallet signature → broadcast → receipt.
 * Guards against duplicate submissions and refreshes the wallet balance on success.
 */
export function useTransaction() {
  const dispatch = useAppDispatch()
  const [state, setState] = useState<TransactionState>(IDLE_STATE)
  const isBusyRef = useRef(false)

  const execute = useCallback(
    async (send: () => Promise<ContractTransactionResponse>): Promise<TransactionResult> => {
      if (isBusyRef.current) return { ok: false, status: 'busy', error: null }
      isBusyRef.current = true
      setState({ status: 'awaitingSignature', hash: null, error: null })

      let hash: string | null = null
      try {
        const transaction = await send()
        hash = transaction.hash
        setState({ status: 'pending', hash, error: null })

        const receipt = await transaction.wait()
        if (!receipt || receipt.status !== 1) throw new Error('Transaction failed')

        setState({ status: 'confirmed', hash, error: null })
        dispatch(refreshBalance())
        return { ok: true, receipt }
      } catch (error) {
        console.error(error)
        const status = isUserRejectedError(error) ? 'cancelled' : 'failed'
        const message = status === 'cancelled' ? 'Transaction cancelled.' : getBlockchainErrorMessage(error)
        setState({ status, hash, error: message })
        return { ok: false, status, error: message }
      } finally {
        isBusyRef.current = false
      }
    },
    [dispatch],
  )

  const reset = useCallback(() => setState(IDLE_STATE), [])

  return {
    ...state,
    isSubmitting: state.status === 'awaitingSignature' || state.status === 'pending',
    execute,
    reset,
  }
}
