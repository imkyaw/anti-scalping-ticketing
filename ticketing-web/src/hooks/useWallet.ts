import { useCallback } from 'react'
import { isWalletAvailable } from '@/blockchain/provider'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { selectIsTargetNetwork, selectWallet } from '@/redux/selectors'
import {
  connectWallet,
  disconnectWallet,
  refreshBalance,
  switchNetwork,
  walletErrorCleared,
} from '@/redux/slices/walletSlice'

export function useWallet() {
  const dispatch = useAppDispatch()
  const wallet = useAppSelector(selectWallet)
  const isTargetNetwork = useAppSelector(selectIsTargetNetwork)

  const connect = useCallback(() => dispatch(connectWallet()), [dispatch])
  const disconnect = useCallback(() => dispatch(disconnectWallet()), [dispatch])
  const switchToTargetNetwork = useCallback(() => dispatch(switchNetwork()), [dispatch])
  const reloadBalance = useCallback(() => dispatch(refreshBalance()), [dispatch])
  const clearError = useCallback(() => dispatch(walletErrorCleared()), [dispatch])

  return {
    ...wallet,
    balanceWei: wallet.balanceWei === null ? null : BigInt(wallet.balanceWei),
    isConnected: wallet.address !== null,
    isTargetNetwork,
    isWalletAvailable: isWalletAvailable(),
    connect,
    disconnect,
    switchToTargetNetwork,
    reloadBalance,
    clearError,
  }
}

/** Address of the connected wallet. Only use inside routes guarded by RequireWallet. */
export function useConnectedAddress(): string {
  const address = useAppSelector((state) => state.wallet.address)
  if (!address) throw new Error('useConnectedAddress used outside a wallet-protected route')
  return address
}
