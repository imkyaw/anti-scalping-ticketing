import { DistributionBar } from '@/components/DistributionBar'
import { EthAmount } from '@/components/EthAmount'
import { GlassCard } from '@/components/GlassCard'
import type { TicketingEvent } from '@/types/ticketing'
import type { EventStats } from '../utils/eventStats'

interface TicketDistributionPanelProps {
  event: TicketingEvent
  stats: EventStats
}

export function TicketDistributionPanel({ event, stats }: TicketDistributionPanelProps) {
  return (
    <GlassCard
      eyebrow="Pool distribution"
      title="Ticket supply"
      extra={<span className="font-mono text-xs text-muted">{event.supply.toString()} total tokens</span>}
    >
      <DistributionBar
        total={event.supply}
        segments={[
          { label: 'Checked in', value: stats.checkedIn, tone: 'success' },
          { label: 'In wallets', value: stats.inWallets, tone: 'primary' },
          { label: 'Unsold', value: stats.unsold, tone: 'neutral' },
        ]}
      />
      <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-xs">
        <div className="rounded-lg border border-line bg-surface-low/60 p-3">
          <p className="text-subtle">Active resale listings</p>
          <p className="mt-1 text-base text-warning-soft">{stats.activeListings}</p>
        </div>
        <div className="rounded-lg border border-line bg-surface-low/60 p-3">
          <p className="text-subtle">Primary revenue</p>
          <EthAmount wei={stats.primaryRevenue} tone="success" className="mt-1 block text-base" />
        </div>
      </div>
    </GlassCard>
  )
}
