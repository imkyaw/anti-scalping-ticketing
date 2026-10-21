/**
 * Central access point for Vite environment variables.
 * Everything exposed through VITE_* is public client-side configuration.
 */

function readPositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function readOptionalString(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export const appConfig = {
  chainId: readPositiveInteger(import.meta.env.VITE_CHAIN_ID, 31337),
  rpcUrl: readOptionalString(import.meta.env.VITE_RPC_URL) ?? 'http://127.0.0.1:8545',
  blockExplorerUrl: readOptionalString(import.meta.env.VITE_BLOCK_EXPLORER_URL),
  checkInQrTtlSeconds: readPositiveInteger(import.meta.env.VITE_CHECK_IN_QR_TTL_SECONDS, 120),
} as const
