import { StatusPill } from '@/components/StatusPill'
import type { Tone } from '@/theme/tones'
import type { TicketStatus } from '@/types/ticketing'
import { TICKET_STATUS_LABELS } from '@/utils/ticketStatus'

const STATUS_TONES: Record<TicketStatus, Tone> = {
  valid: 'success',
  listed: 'warning',
  used: 'neutral',
}

export function TicketStatusPill({ status }: { status: TicketStatus }) {
  return (
    <StatusPill tone={STATUS_TONES[status]} dot pulse={status === 'valid'}>
      {TICKET_STATUS_LABELS[status]}
    </StatusPill>
  )
}
