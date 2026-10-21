import { isTargetChain } from '@/blockchain/networks'
import type { RootState } from './store'

export const selectWallet = (state: RootState) => state.wallet
export const selectIsWalletConnected = (state: RootState) => state.wallet.address !== null
export const selectThemeMode = (state: RootState) => state.theme.mode
export const selectIsTargetNetwork = (state: RootState) => isTargetChain(state.wallet.chainId)
