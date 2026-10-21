import { AddressText } from '@/components/AddressText'
import type { CheckInVerification } from '@/services/checkInService'
import { formatEventId } from '@/utils/formatters'

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface-low/60 p-3">
      <p className="label-caps text-subtle">{label}</p>
      <div className="mt-1.5 text-sm text-ink">{children}</div>
    </div>
  )
}

export function TicketFacts({ verification, statusLabel }: { verification: CheckInVerification; statusLabel: React.ReactNode }) {
  const { pass, ticket } = verification
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Fact label="Event">
        {ticket?.event.name ?? 'Unknown event'}
        <p className="mt-0.5 font-mono text-[11px] text-subtle">Pass event {formatEventId(pass.eventId)}</p>
      </Fact>
      <Fact label="Status">{statusLabel}</Fact>
      <Fact label="Pass holder">
        <AddressText address={pass.holder} />
      </Fact>
      <Fact label="On-chain owner">{ticket ? <AddressText address={ticket.owner} /> : '—'}</Fact>
    </div>
  )
}
