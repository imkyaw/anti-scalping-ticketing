import { useEffect } from 'react'
import { getInjectedProvider, resetBrowserProvider } from '@/blockchain/provider'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import {
  accountChanged,
  chainChanged,
  refreshBalance,
  restoreWalletSession,
} from '@/redux/slices/walletSlice'

/**
 * Mount once at the app root: restores an authorised session and keeps Redux
 * in sync when the user switches accounts or networks inside MetaMask.
 */
export function useWalletSync(): void {
  const dispatch = useAppDispatch()
  const address = useAppSelector((state) => state.wallet.address)
  const chainId = useAppSelector((state) => state.wallet.chainId)

  useEffect(() => {
    dispatch(restoreWalletSession())

    const injected = getInjectedProvider()
    if (!injected?.on) return

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = Array.isArray(args[0]) ? (args[0] as string[]) : []
      dispatch(accountChanged(accounts[0] ?? null))
    }
    const handleChainChanged = (...args: unknown[]) => {
      resetBrowserProvider()
      dispatch(chainChanged(Number(args[0])))
    }

    injected.on('accountsChanged', handleAccountsChanged)
    injected.on('chainChanged', handleChainChanged)
    return () => {
      injected.removeListener?.('accountsChanged', handleAccountsChanged)
      injected.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [dispatch])

  useEffect(() => {
    if (address && chainId) dispatch(refreshBalance())
  }, [dispatch, address, chainId])
}
