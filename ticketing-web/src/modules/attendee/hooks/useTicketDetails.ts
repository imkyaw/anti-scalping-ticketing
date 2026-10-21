import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchTicketHistory, fetchTicketWithEvent } from '@/services/ticketService'

export function useTicketDetails(tokenId: bigint) {
  const loader = useCallback(async () => {
    const [ticket, history] = await Promise.all([fetchTicketWithEvent(tokenId), fetchTicketHistory(tokenId)])
    return { ticket, history }
  }, [tokenId])

  return useAsyncData(loader)
}
