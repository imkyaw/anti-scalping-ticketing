import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getAddress } from 'ethers'
import { isTargetChain } from '@/blockchain/networks'
import {
  getAuthorizedAccounts,
  getBalance,
  getCurrentChainId,
  isWalletAvailable,
  requestAccounts,
  revokeAccountPermission,
  switchToTargetNetwork,
} from '@/blockchain/provider'
import { getBlockchainErrorMessage } from '@/utils/blockchainErrors'

export interface WalletState {
  address: string | null
  chainId: number | null
  /** Stored as a decimal string because Redux state must stay serialisable. */
  balanceWei: string | null
  isRestoring: boolean
  isConnecting: boolean
  isSwitchingNetwork: boolean
  error: string | null
}

const initialState: WalletState = {
  address: null,
  chainId: null,
  balanceWei: null,
  isRestoring: true,
  isConnecting: false,
  isSwitchingNetwork: false,
  error: null,
}

interface WalletSession {
  address: string | null
  chainId: number | null
}

/** Silent restore on page load: uses eth_accounts, never opens a MetaMask prompt. */
export const restoreWalletSession = createAsyncThunk<WalletSession>(
  'wallet/restoreSession',
  async () => {
    if (!isWalletAvailable()) return { address: null, chainId: null }
    const [accounts, chainId] = await Promise.all([getAuthorizedAccounts(), getCurrentChainId()])
    return { address: accounts[0] ?? null, chainId }
  },
)

export const connectWallet = createAsyncThunk<WalletSession, void, { rejectValue: string }>(
  'wallet/connect',
  async (_, { rejectWithValue }) => {
    try {
      const accounts = await requestAccounts()
      return { address: accounts[0] ?? null, chainId: await getCurrentChainId() }
    } catch (error) {
      console.error(error)
      return rejectWithValue(getBlockchainErrorMessage(error))
    }
  },
)

export const switchNetwork = createAsyncThunk<number, void, { rejectValue: string }>(
  'wallet/switchNetwork',
  async (_, { rejectWithValue }) => {
    try {
      await switchToTargetNetwork()
      return await getCurrentChainId()
    } catch (error) {
      console.error(error)
      return rejectWithValue(getBlockchainErrorMessage(error))
    }
  },
)

export const refreshBalance = createAsyncThunk<string | null>(
  'wallet/refreshBalance',
  async (_, { getState }) => {
    const { address, chainId } = (getState() as { wallet: WalletState }).wallet
    if (!address || !isTargetChain(chainId)) return null
    return (await getBalance(address)).toString()
  },
)

export const disconnectWallet = createAsyncThunk('wallet/disconnect', async () => {
  await revokeAccountPermission()
})

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    accountChanged(state, action: PayloadAction<string | null>) {
      state.address = action.payload ? getAddress(action.payload.toLowerCase()) : null
      state.balanceWei = null
    },
    chainChanged(state, action: PayloadAction<number>) {
      state.chainId = action.payload
      state.balanceWei = null
    },
    walletErrorCleared(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreWalletSession.fulfilled, (state, action) => {
        state.address = action.payload.address
        state.chainId = action.payload.chainId
        state.isRestoring = false
      })
      .addCase(restoreWalletSession.rejected, (state) => {
        state.isRestoring = false
      })
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true
        state.error = null
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.address = action.payload.address
        state.chainId = action.payload.chainId
        state.isConnecting = false
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false
        state.error = action.payload ?? 'Could not connect to MetaMask.'
      })
      .addCase(switchNetwork.pending, (state) => {
        state.isSwitchingNetwork = true
        state.error = null
      })
      .addCase(switchNetwork.fulfilled, (state, action) => {
        state.chainId = action.payload
        state.isSwitchingNetwork = false
      })
      .addCase(switchNetwork.rejected, (state, action) => {
        state.isSwitchingNetwork = false
        state.error = action.payload ?? 'Could not switch network.'
      })
      .addCase(refreshBalance.fulfilled, (state, action) => {
        state.balanceWei = action.payload
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.address = null
        state.balanceWei = null
      })
  },
})

export const { accountChanged, chainChanged, walletErrorCleared } = walletSlice.actions
export default walletSlice.reducer
