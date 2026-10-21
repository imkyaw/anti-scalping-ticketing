import { SettingOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { DistributionBar } from '@/components/DistributionBar'
import { EthAmount } from '@/components/EthAmount'
import { EventSaleStatusPill } from '@/components/EventSaleStatusPill'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { TicketingEvent } from '@/types/ticketing'
import { formatEventId } from '@/utils/formatters'
import type { EventStats } from '../utils/eventStats'
import { SaleToggleButton } from './SaleToggleButton'

interface ManagedEventCardProps {
  event: TicketingEvent
  stats: EventStats
  onChanged: () => void
}

export function ManagedEventCard({ event, stats, onChanged }: ManagedEventCardProps) {
  return (
    <article className="glass-card flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <EventSaleStatusPill event={event} />
        <span className="font-mono text-xs text-muted">ID: {formatEventId(event.eventId)}</span>
      </div>

      <h3 className="text-xl font-semibold text-ink sm:text-2xl">{event.name}</h3>

      <DistributionBar
        total={event.supply}
        segments={[
          { label: 'Checked in', value: stats.checkedIn, tone: 'success' },
          { label: 'In wallets', value: stats.inWallets, tone: 'primary' },
          { label: 'Unsold', value: stats.unsold, tone: 'neutral' },
        ]}
      />

      <div className="mt-auto flex flex-col gap-4 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted">
          Ceiling: <EthAmount wei={event.facePrice} className="text-ink" />
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTE_PATHS.manageEvent(event.eventId)}>
            <Button icon={<SettingOutlined />}>Manage</Button>
          </Link>
          <SaleToggleButton event={event} onChanged={onChanged} />
        </div>
      </div>
    </article>
  )
}
