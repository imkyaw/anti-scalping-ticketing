import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchAllEvents } from '@/services/eventService'

export function useEvents() {
  return useAsyncData(fetchAllEvents)
}
