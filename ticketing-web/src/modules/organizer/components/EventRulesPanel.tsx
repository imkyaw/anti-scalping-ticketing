import { SafetyCertificateOutlined } from '@ant-design/icons'
import { getEventTicketingAddress } from '@/blockchain/contracts'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import { GlassCard } from '@/components/GlassCard'
import { InfoRow } from '@/components/InfoRow'
import { StatusPill } from '@/components/StatusPill'
import type { TicketingEvent } from '@/types/ticketing'
import { formatEthWithSymbol } from '@/utils/formatters'

export function EventRulesPanel({ event }: { event: TicketingEvent }) {
  return (
    <GlassCard
      title="Contract rules & parameters"
      extra={
        <StatusPill tone="success" dot>
          Immutable
        </StatusPill>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <InfoRow label="Ticket face value" value={<EthAmount wei={event.facePrice} />} />
        <InfoRow label="Max / wallet" value={`${event.perWalletCap.toString()} NFTs`} />
        <InfoRow label="Total supply" value={event.supply.toString()} />
        <InfoRow
          label="Resale ceiling"
          value="100% face value"
          hint={`Strictly enforced (${formatEthWithSymbol(event.facePrice)} max)`}
          tone="success"
        />
        <InfoRow label="Organiser" value={<AddressText address={event.organiser} />} />
        <InfoRow label="Smart contract" value={<AddressText address={getEventTicketingAddress()} />} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-success-soft">
          <SafetyCertificateOutlined /> Anti-scalping engine
        </span>
        <span className="label-caps text-success-soft">Active & enforced</span>
      </div>
    </GlassCard>
  )
}
