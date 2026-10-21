import { Select } from 'antd'
import { AddressText } from '@/components/AddressText'
import { CheckList } from '@/components/CheckList'
import { EthAmount } from '@/components/EthAmount'
import { GlassCard } from '@/components/GlassCard'
import type { TicketWithEvent } from '@/types/ticketing'
import { formatTokenId } from '@/utils/formatters'
import { hasActiveListing } from '@/utils/ticketStatus'

interface ResaleTicketPanelProps {
  tickets: TicketWithEvent[]
  selected: TicketWithEvent | null
  onSelect: (tokenId: bigint) => void
}

export function ResaleTicketPanel({ tickets, selected, onSelect }: ResaleTicketPanelProps) {
  return (
    <GlassCard eyebrow="Step 01" title="Your ticket" extra={<span className="font-mono text-xs text-muted">ERC-721</span>}>
      <Select
        className="w-full"
        size="large"
        placeholder="Choose a ticket to sell"
        value={selected ? selected.tokenId.toString() : undefined}
        onChange={(value: string) => onSelect(BigInt(value))}
        options={tickets.map((ticket) => ({
          value: ticket.tokenId.toString(),
          label: `${formatTokenId(ticket.tokenId)} · ${ticket.event.name}`,
        }))}
      />

      {selected && (
        <div className="mt-5 flex flex-col gap-5">
          <div className="rounded-xl border border-line bg-surface-low/60 p-4">
            <p className="label-caps text-success-soft">General admission</p>
            <p className="mt-2 font-display text-2xl font-bold text-primary-soft">
              Ticket {formatTokenId(selected.tokenId)}
            </p>
            <p className="text-sm text-ink">{selected.event.name}</p>
          </div>

          <div>
            <p className="label-caps mb-3 text-muted">Verification status</p>
            <CheckList
              items={[
                { key: 'valid', label: 'Valid ERC-721 ticket', passed: true },
                { key: 'unused', label: 'Unused', passed: !selected.isUsed },
                {
                  key: 'owner',
                  label: 'Ownership verified',
                  passed: true,
                  detail: <AddressText address={selected.owner} copyable={false} />,
                },
              ]}
            />
          </div>

          {hasActiveListing(selected) && selected.listing && (
            <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-soft">
              Already listed at <EthAmount wei={selected.listing.price} tone="warning" />. Submitting a new price updates
              the listing.
            </p>
          )}
        </div>
      )}
    </GlassCard>
  )
}
