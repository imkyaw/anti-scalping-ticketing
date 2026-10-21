import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchEventsByOrganiser } from '@/services/eventService'
import { fetchAllTickets } from '@/services/ticketService'
import { computeEventStats } from '../utils/eventStats'

export function useOrganizerEvents(organiser: string) {
  const loader = useCallback(async () => {
    const [events, tickets] = await Promise.all([fetchEventsByOrganiser(organiser), fetchAllTickets()])
    return events
      .map((event) => ({ event, stats: computeEventStats(event, tickets) }))
      .sort((a, b) => Number(b.event.eventId - a.event.eventId))
  }, [organiser])

  return useAsyncData(loader)
}
