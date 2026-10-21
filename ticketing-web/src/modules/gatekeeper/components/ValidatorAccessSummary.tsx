import { Alert } from 'antd'
import { StatusPill } from '@/components/StatusPill'
import type { AsyncDataState } from '@/hooks/useAsyncData'
import type { TicketingEvent } from '@/types/ticketing'
import { formatEventId } from '@/utils/formatters'

/** Which events this wallet may validate (read from isValidator on the contract). */
export function ValidatorAccessSummary({ state }: { state: AsyncDataState<TicketingEvent[]> }) {
  if (state.error) return <Alert type="error" showIcon title={state.error} className="mb-6!" />
  if (!state.data) return null

  if (state.data.length === 0) {
    return (
      <Alert
        className="mb-6!"
        type="warning"
        showIcon
        title="This wallet is not a validator for any event"
        description="Ask the event organiser to grant your wallet the validator role (Organizer → Manage event). Uploaded passes will be rejected until then."
      />
    )
  }

  return (
    <div className="glass-panel mb-6 flex flex-wrap items-center gap-2 p-4">
      <span className="label-caps mr-2 text-muted">Validator for</span>
      {state.data.map((event) => (
        <StatusPill key={event.eventId.toString()} tone="success" dot>
          {formatEventId(event.eventId)} · {event.name}
        </StatusPill>
      ))}
    </div>
  )
}
