import { formatEther } from 'ethers'
import { TARGET_NETWORK } from '@/blockchain/networks'

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function isSameAddress(a: string | null | undefined, b: string | null | undefined): boolean {
  return Boolean(a && b && a.toLowerCase() === b.toLowerCase())
}

/** Format wei as ETH, trimming to `maxDecimals` without losing precision in the integer part. */
export function formatEth(wei: bigint, maxDecimals = 4): string {
  const [whole, fraction = ''] = formatEther(wei).split('.')
  const trimmed = fraction.slice(0, maxDecimals).replace(/0+$/, '')
  const minimum = trimmed.length < 3 ? trimmed.padEnd(3, '0') : trimmed
  return `${whole}.${minimum}`
}

export function formatEthWithSymbol(wei: bigint, maxDecimals = 4): string {
  return `${formatEth(wei, maxDecimals)} ${TARGET_NETWORK.currencySymbol}`
}

export function formatTokenId(tokenId: bigint | string): string {
  return `#${tokenId.toString().padStart(4, '0')}`
}

export function formatEventId(eventId: bigint | string): string {
  return `EVT-${eventId.toString().padStart(3, '0')}`
}

export function formatDateTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatTime(unixMilliseconds: number): string {
  return new Date(unixMilliseconds).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

/** Percentage of `part` over `whole`, as a number between 0 and 100. */
export function toPercent(part: bigint, whole: bigint): number {
  if (whole === 0n) return 0
  return Number((part * 10_000n) / whole) / 100
}
