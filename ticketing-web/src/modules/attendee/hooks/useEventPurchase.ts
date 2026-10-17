import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchEvent, fetchPurchasedCount } from '@/services/eventService'

export function useEventPurchase(eventId: bigint, account: string) {
  const loader = useCallback(async () => {
    const [event, purchasedCount] = await Promise.all([
      fetchEvent(eventId),
      fetchPurchasedCount(eventId, account),
    ])
    return { event, purchasedCount }
  }, [eventId, account])

  return useAsyncData(loader)
}
