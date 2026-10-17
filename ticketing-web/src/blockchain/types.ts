import type { Eip1193Provider } from 'ethers'

export type WalletEventHandler = (...args: unknown[]) => void

/** The EIP-1193 provider MetaMask injects as `window.ethereum`. */
export interface InjectedEthereumProvider extends Eip1193Provider {
  isMetaMask?: boolean
  on?: (event: string, handler: WalletEventHandler) => void
  removeListener?: (event: string, handler: WalletEventHandler) => void
}

export interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  currencySymbol: string
  blockExplorerUrl: string | null
}
