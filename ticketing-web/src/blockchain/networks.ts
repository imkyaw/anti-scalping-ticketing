import { appConfig } from '@/env/appConfig'
import type { NetworkConfig } from './types'

export const SUPPORTED_CHAINS = {
  hardhatLocal: {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: appConfig.rpcUrl,
    currencySymbol: 'ETH',
    blockExplorerUrl: appConfig.blockExplorerUrl,
  },
} as const satisfies Record<string, NetworkConfig>

const supportedNetworks: NetworkConfig[] = Object.values(SUPPORTED_CHAINS)

/** The one network this dApp expects MetaMask to be connected to. */
export const TARGET_NETWORK: NetworkConfig =
  supportedNetworks.find((network) => network.chainId === appConfig.chainId) ??
  SUPPORTED_CHAINS.hardhatLocal

export function isTargetChain(chainId: number | null): boolean {
  return chainId === TARGET_NETWORK.chainId
}

export function getTransactionUrl(hash: string): string | null {
  if (!TARGET_NETWORK.blockExplorerUrl) return null
  return `${TARGET_NETWORK.blockExplorerUrl.replace(/\/$/, '')}/tx/${hash}`
}
