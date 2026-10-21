export interface ResalePriceEvaluation {
  price: bigint | null
  isPositive: boolean
  isWithinCap: boolean
  /** Price minus face value, in wei (negative = discount). */
  deltaWei: bigint | null
  /** Price as a percentage of face value. */
  ratioPercent: number | null
}

/** Mirrors the contract rule `require(price <= ticketFacePrice[tokenId])` for instant feedback. */
export function evaluateResalePrice(price: bigint | null, facePrice: bigint): ResalePriceEvaluation {
  if (price === null) {
    return { price, isPositive: false, isWithinCap: false, deltaWei: null, ratioPercent: null }
  }
  return {
    price,
    isPositive: price > 0n,
    isWithinCap: price <= facePrice,
    deltaWei: price - facePrice,
    ratioPercent: facePrice === 0n ? null : Number((price * 10_000n) / facePrice) / 100,
  }
}
