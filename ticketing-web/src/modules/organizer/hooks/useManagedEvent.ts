import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchEvent } from '@/services/eventService'
import { fetchAllTickets } from '@/services/ticketService'
import { fetchEventValidators } from '@/services/validationService'
import { computeEventStats } from '../utils/eventStats'

export function useManagedEvent(eventId: bigint) {
  const loader = useCallback(async () => {
    const [event, tickets, validators] = await Promise.all([
      fetchEvent(eventId),
      fetchAllTickets(),
      fetchEventValidators(eventId),
    ])
    return { event, stats: computeEventStats(event, tickets), validators }
  }, [eventId])

  return useAsyncData(loader)
}
