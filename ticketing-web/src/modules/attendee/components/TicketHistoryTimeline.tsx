import { Timeline } from 'antd'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import { GlassCard } from '@/components/GlassCard'
import type { TicketHistoryEntry, TicketHistoryKind } from '@/types/ticketing'
import { formatDateTime, shortenAddress } from '@/utils/formatters'

const KIND_META: Record<TicketHistoryKind, { title: string; color: string }> = {
  purchased: { title: 'Ticket minted (primary sale)', color: '#10B981' },
  listed: { title: 'Listed for resale', color: '#F59E0B' },
  resold: { title: 'Resold at a capped price', color: '#6366F1' },
  used: { title: 'Checked in at the gate', color: '#9CA3AF' },
}

function HistoryDetail({ entry }: { entry: TicketHistoryEntry }) {
  switch (entry.kind) {
    case 'purchased':
      return (
        <>
          Bought by <AddressText address={entry.actor} copyable={false} /> for{' '}
          {entry.price !== null && <EthAmount wei={entry.price} />}
        </>
      )
    case 'listed':
      return (
        <>
          <AddressText address={entry.actor} copyable={false} /> listed it at{' '}
          {entry.price !== null && <EthAmount wei={entry.price} tone="warning" />}
        </>
      )
    case 'resold':
      return (
        <>
          <AddressText address={entry.counterparty ?? entry.actor} copyable={false} /> →{' '}
          <AddressText address={entry.actor} copyable={false} /> for{' '}
          {entry.price !== null && <EthAmount wei={entry.price} />}
        </>
      )
    case 'used':
      return (
        <>
          Validated by <AddressText address={entry.actor} copyable={false} />
        </>
      )
  }
}

export function TicketHistoryTimeline({ history }: { history: TicketHistoryEntry[] }) {
  return (
    <GlassCard eyebrow="Provenance & verification ledger" title="Ticket history">
      {history.length === 0 ? (
        <p className="text-sm text-muted">No on-chain activity found for this ticket.</p>
      ) : (
        <Timeline
          items={history.map((entry) => ({
            color: KIND_META[entry.kind].color,
            content: (
              <div className="rounded-xl border border-line bg-surface-low/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{KIND_META[entry.kind].title}</p>
                  <span className="label-caps rounded-full bg-success/10 px-2 py-0.5 text-success-soft">
                    Block #{entry.blockNumber}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  <HistoryDetail entry={entry} />
                </p>
                <p className="mt-2 font-mono text-[11px] text-subtle">
                  Tx {shortenAddress(entry.txHash)}
                  {entry.timestamp !== null && ` · ${formatDateTime(entry.timestamp)}`}
                </p>
              </div>
            ),
          }))}
        />
      )}
    </GlassCard>
  )
}
