import { LockOutlined, QrcodeOutlined, UserOutlined } from '@ant-design/icons'
import { getEventTicketingAddress } from '@/blockchain/contracts'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import { FeatureTile } from '@/components/FeatureTile'
import { GlassCard } from '@/components/GlassCard'
import { InfoRow } from '@/components/InfoRow'
import type { TicketingEvent } from '@/types/ticketing'
import { formatEventId } from '@/utils/formatters'

export function EventOverviewCard({ event }: { event: TicketingEvent }) {
  return (
    <div className="flex flex-col gap-6">
      <section className="glass-card relative overflow-hidden p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_80%_0%,rgba(99,102,241,0.35),transparent_70%),radial-gradient(30rem_18rem_at_0%_100%,rgba(16,185,129,0.18),transparent_70%)]" />
        <div className="relative">
          <p className="label-caps text-warning-soft">Event {formatEventId(event.eventId)} · On-chain primary sale</p>
          <h1 className="mt-4 text-4xl font-bold text-ink sm:text-5xl">{event.name}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm text-muted">
            Organised by <AddressText address={event.organiser} />
          </p>
        </div>
      </section>

      <GlassCard eyebrow="Protocol manifesto" title="How this event is protected">
        <div className="grid gap-3 sm:grid-cols-3">
          <FeatureTile
            icon={<LockOutlined />}
            title="Face-value resale cap"
            description="The contract rejects any resale listing above the original face value."
          />
          <FeatureTile
            icon={<UserOutlined />}
            title="Per-wallet limit"
            description={`Each wallet can buy at most ${event.perWalletCap.toString()} ticket(s) for this event.`}
            tone="primary"
          />
          <FeatureTile
            icon={<QrcodeOutlined />}
            title="Signed check-in QR"
            description="Entry needs a fresh wallet signature and is recorded on-chain exactly once."
            tone="warning"
          />
        </div>
      </GlassCard>

      <GlassCard eyebrow="Immutable rules" title="Contract parameters">
        <div className="flex flex-col gap-2">
          <InfoRow label="Face value" value={<EthAmount wei={event.facePrice} />} />
          <InfoRow label="Total supply" value={event.supply.toString()} />
          <InfoRow label="Max per wallet" value={`${event.perWalletCap.toString()} NFTs`} />
          <InfoRow
            label="Resale ceiling"
            value={<EthAmount wei={event.facePrice} tone="success" />}
            hint="100% of face value"
          />
          <InfoRow label="Smart contract" value={<AddressText address={getEventTicketingAddress()} />} />
        </div>
      </GlassCard>
    </div>
  )
}
