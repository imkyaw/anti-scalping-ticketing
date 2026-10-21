import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { attachEvents, fetchTicketsOf } from '@/services/ticketService'

export function useMyTickets(account: string) {
  const loader = useCallback(async () => attachEvents(await fetchTicketsOf(account)), [account])
  return useAsyncData(loader)
}
