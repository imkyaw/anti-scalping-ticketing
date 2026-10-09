import { BrowserProvider, getAddress, toQuantity, type JsonRpcSigner } from 'ethers'
import { WalletUnavailableError, WrongNetworkError } from './errors'
import { isTargetChain, TARGET_NETWORK } from './networks'
import type { InjectedEthereumProvider } from './types'

const UNRECOGNIZED_CHAIN_ERROR_CODE = 4902

let browserProvider: BrowserProvider | null = null

export function getInjectedProvider(): InjectedEthereumProvider | null {
  return typeof window !== 'undefined' && window.ethereum ? window.ethereum : null
}

export function isWalletAvailable(): boolean {
  return getInjectedProvider() !== null
}

function requireInjectedProvider(): InjectedEthereumProvider {
  const injected = getInjectedProvider()
  if (!injected) throw new WalletUnavailableError()
  return injected
}

/**
 * One shared ethers provider; recreated after MetaMask switches chains.
 * cacheTimeout -1 turns off ethers' 250ms request sharing, so reads made right
 * after a confirmed transaction (instant on Hardhat) never return pre-tx results.
 */
export function getBrowserProvider(): BrowserProvider {
  if (!browserProvider) {
    browserProvider = new BrowserProvider(requireInjectedProvider(), 'any', { cacheTimeout: -1 })
  }
  return browserProvider
}

export function resetBrowserProvider(): void {
  browserProvider = null
}

function toChecksumAccounts(accounts: unknown): string[] {
  return Array.isArray(accounts) ? accounts.map((account) => getAddress(String(account).toLowerCase())) : []
}

/** Accounts already authorised for this site. Never opens a MetaMask prompt. */
export async function getAuthorizedAccounts(): Promise<string[]> {
  const accounts = await requireInjectedProvider().request({ method: 'eth_accounts' })
  return toChecksumAccounts(accounts)
}

/** Opens the MetaMask connection prompt. Only call from an explicit user action. */
export async function requestAccounts(): Promise<string[]> {
  const accounts = await requireInjectedProvider().request({ method: 'eth_requestAccounts' })
  return toChecksumAccounts(accounts)
}

export async function getCurrentChainId(): Promise<number> {
  const chainIdHex = await requireInjectedProvider().request({ method: 'eth_chainId' })
  return Number(chainIdHex)
}

export async function assertTargetNetwork(): Promise<void> {
  if (!isTargetChain(await getCurrentChainId())) throw new WrongNetworkError()
}

export async function getSigner(): Promise<JsonRpcSigner> {
  await assertTargetNetwork()
  return getBrowserProvider().getSigner()
}

export async function getBalance(address: string): Promise<bigint> {
  return getBrowserProvider().getBalance(address)
}

export async function switchToTargetNetwork(): Promise<void> {
  const injected = requireInjectedProvider()
  const chainId = toQuantity(TARGET_NETWORK.chainId)

  try {
    await injected.request({ method: 'wallet_switchEthereumChain', params: [{ chainId }] })
  } catch (error) {
    if ((error as { code?: number }).code !== UNRECOGNIZED_CHAIN_ERROR_CODE) throw error

    await injected.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId,
          chainName: TARGET_NETWORK.name,
          rpcUrls: [TARGET_NETWORK.rpcUrl],
          nativeCurrency: { name: 'Ether', symbol: TARGET_NETWORK.currencySymbol, decimals: 18 },
          blockExplorerUrls: TARGET_NETWORK.blockExplorerUrl ? [TARGET_NETWORK.blockExplorerUrl] : null,
        },
      ],
    })
  }
}

/** Best effort: MetaMask supports revoking the site's account permission. */
export async function revokeAccountPermission(): Promise<void> {
  const injected = getInjectedProvider()
  if (!injected) return
  try {
    await injected.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] })
  } catch {
    // Older wallets do not support revoking; clearing app state is enough.
  }
}
