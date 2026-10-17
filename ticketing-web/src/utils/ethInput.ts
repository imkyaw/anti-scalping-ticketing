import { parseEther } from 'ethers'

/** Parse a user-typed ETH amount; returns null for empty or malformed input. */
export function parseEthInput(value: string | null | undefined): bigint | null {
  const trimmed = value?.trim()
  if (!trimmed || !/^\d*\.?\d{0,18}$/.test(trimmed) || trimmed === '.') return null
  try {
    return parseEther(trimmed)
  } catch {
    return null
  }
}
