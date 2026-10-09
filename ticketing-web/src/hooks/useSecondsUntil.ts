import { useEffect, useState } from 'react'

function secondsUntil(unixSeconds: number): number {
  return Math.max(0, unixSeconds - Math.floor(Date.now() / 1000))
}

/** Live countdown (in seconds) to a unix timestamp; null input means no countdown. */
export function useSecondsUntil(unixSeconds: number | null): number | null {
  const [tick, setTick] = useState<{ target: number | null; remaining: number | null }>({
    target: null,
    remaining: null,
  })

  useEffect(() => {
    if (unixSeconds === null) return
    const update = () => setTick({ target: unixSeconds, remaining: secondsUntil(unixSeconds) })
    const timer = window.setInterval(update, 1000)
    const firstUpdate = window.setTimeout(update, 0)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(firstUpdate)
    }
  }, [unixSeconds])

  if (unixSeconds === null) return null
  return tick.target === unixSeconds ? tick.remaining : null
}
