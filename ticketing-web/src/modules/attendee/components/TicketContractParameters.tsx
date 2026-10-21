import { ArrowLeftOutlined, TagOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { getEventTicketingAddress } from '@/blockchain/contracts'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import { GlassCard } from '@/components/GlassCard'
import { InfoRow } from '@/components/InfoRow'
import { StatusPill } from '@/components/StatusPill'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { TicketStatus, TicketWithEvent } from '@/types/ticketing'
import { formatEthWithSymbol } from '@/utils/formatters'
import { CancelListingButton } from './CancelListingButton'

interface TicketContractParametersProps {
  ticket: TicketWithEvent
  status: TicketStatus
  isOwner: boolean
  onChanged: () => void
}

const PROTOCOL_STATUS_COPY: Record<TicketStatus, string> = {
  valid: 'Unused & unlisted',
  listed: 'Listed for resale',
  used: 'Used · checked in',
}

export function TicketContractParameters({ ticket, status, isOwner, onChanged }: TicketContractParametersProps) {
  return (
    <GlassCard
      eyebrow="On-chain consensus"
      title="Contract parameters"
      extra={<StatusPill tone="success">Immutable rules</StatusPill>}
    >
      <div className="flex flex-col gap-2">
        <InfoRow label="Smart contract" value={<AddressText address={getEventTicketingAddress()} />} />
        <InfoRow label="Current owner" value={<AddressText address={ticket.owner} isSelf={isOwner} />} tone="success" />
        <InfoRow label="Original face value" value={<EthAmount wei={ticket.facePrice} />} />
        <InfoRow
          label="Resale price ceiling"
          value={`MAX ${formatEthWithSymbol(ticket.facePrice)}`}
          hint="No markup permitted"
          tone="warning"
        />
        {status === 'listed' && ticket.listing && (
          <InfoRow label="Current listing" value={<EthAmount wei={ticket.listing.price} tone="warning" />} />
        )}
        <InfoRow
          label="Protocol status"
          value={PROTOCOL_STATUS_COPY[status]}
          tone={status === 'used' ? 'neutral' : status === 'listed' ? 'warning' : 'success'}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {isOwner && status === 'valid' && (
          <Link to={ROUTE_PATHS.listForResale(ticket.tokenId)} className="sm:flex-1">
            <Button type="primary" size="large" block icon={<TagOutlined />}>
              List for resale
            </Button>
          </Link>
        )}
        {isOwner && status === 'listed' && (
          <div className="sm:flex-1">
            <CancelListingButton tokenId={ticket.tokenId} onCancelled={onChanged} block />
          </div>
        )}
        {!isOwner && status === 'listed' && (
          <Link to={ROUTE_PATHS.marketplace} className="sm:flex-1">
            <Button type="primary" size="large" block>
              Buy on marketplace
            </Button>
          </Link>
        )}
        <Link to={ROUTE_PATHS.myTickets}>
          <Button size="large" block icon={<ArrowLeftOutlined />}>
            Back to my tickets
          </Button>
        </Link>
      </div>
    </GlassCard>
  )
}
