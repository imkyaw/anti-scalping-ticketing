import type { TicketingEvent } from '@/types/ticketing'
import { StatusPill } from './StatusPill'

export function EventSaleStatusPill({ event }: { event: TicketingEvent }) {
  if (event.sold >= event.supply) {
    return (
      <StatusPill tone="warning" dot>
        Sold out
      </StatusPill>
    )
  }
  return event.saleOpen ? (
    <StatusPill tone="success" dot pulse>
      Sale active
    </StatusPill>
  ) : (
    <StatusPill tone="neutral" dot>
      Sale closed
    </StatusPill>
  )
}
