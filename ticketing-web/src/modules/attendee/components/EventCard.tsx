import { ArrowRightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import { EventSaleStatusPill } from '@/components/EventSaleStatusPill'
import { SupplyMeter } from '@/components/SupplyMeter'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { TicketingEvent } from '@/types/ticketing'
import { formatEventId } from '@/utils/formatters'

export function EventCard({ event }: { event: TicketingEvent }) {
  return (
    <article className="glass-card flex flex-col gap-5 p-5 transition hover:border-primary/40!">
      <div className="flex items-center justify-between gap-3">
        <EventSaleStatusPill event={event} />
        <span className="font-mono text-xs text-muted">ID: {formatEventId(event.eventId)}</span>
      </div>

      <div className="min-w-0">
        <h3 className="truncate text-xl font-semibold text-ink">{event.name}</h3>
        <p className="mt-1 flex items-center gap-2 text-xs text-muted">
          Organiser <AddressText address={event.organiser} copyable={false} className="text-muted" />
        </p>
      </div>

      <SupplyMeter sold={event.sold} supply={event.supply} />

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
        <div>
          <p className="label-caps text-muted">Face value</p>
          <EthAmount wei={event.facePrice} tone="warning" className="text-lg" />
          <p className="mt-0.5 font-mono text-[11px] text-subtle">Max {event.perWalletCap.toString()} per wallet</p>
        </div>
        <Link to={ROUTE_PATHS.eventDetails(event.eventId)}>
          <Button type="primary" icon={<ArrowRightOutlined />} iconPlacement="end">
            View
          </Button>
        </Link>
      </div>
    </article>
  )
}
