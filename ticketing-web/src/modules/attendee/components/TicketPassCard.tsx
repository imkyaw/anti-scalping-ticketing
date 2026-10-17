import { CheckCircleOutlined, EyeOutlined, ShopOutlined, TagOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { EthAmount } from '@/components/EthAmount'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { TicketWithEvent } from '@/types/ticketing'
import { formatTokenId } from '@/utils/formatters'
import { getTicketStatus } from '@/utils/ticketStatus'
import { CancelListingButton } from './CancelListingButton'
import { TicketStatusPill } from './TicketStatusPill'

interface TicketPassCardProps {
  ticket: TicketWithEvent
  onChanged: () => void
}

export function TicketPassCard({ ticket, onChanged }: TicketPassCardProps) {
  const status = getTicketStatus(ticket)
  const isUsed = status === 'used'

  return (
    <article className={`glass-card flex flex-col overflow-hidden ${isUsed ? 'opacity-70' : ''}`}>
      <div className="relative bg-[linear-gradient(135deg,rgba(99,102,241,0.25),transparent_60%)] p-5 pb-6">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-md border border-line bg-canvas/70 px-2 py-1 font-mono text-xs text-ink">
            ID: {formatTokenId(ticket.tokenId)}
          </span>
          <TicketStatusPill status={status} />
        </div>
        <p className="label-caps mt-10 text-primary-soft">
          {isUsed ? 'Checked-in token' : 'ERC-721 secured pass'}
        </p>
        <h3 className="mt-1 truncate text-lg font-semibold text-ink">{ticket.event.name}</h3>
      </div>

      {status === 'listed' && ticket.listing && (
        <div className="flex items-center gap-2 border-y border-warning/30 bg-warning/10 px-5 py-2 font-mono text-xs text-warning-soft">
          <ShopOutlined /> Listed on the resale marketplace
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface-low/60 p-4">
          <div>
            <p className="label-caps text-subtle">Face value</p>
            <EthAmount wei={ticket.facePrice} tone={status === 'listed' ? 'neutral' : 'success'} strikethrough={status === 'listed'} />
          </div>
          <div>
            <p className="label-caps text-subtle">{status === 'listed' ? 'Listed at' : 'Max resale cap'}</p>
            <EthAmount wei={ticket.listing && status === 'listed' ? ticket.listing.price : ticket.facePrice} tone="warning" />
          </div>
        </div>

        {isUsed && (
          <p className="flex items-start gap-2 text-xs text-muted">
            <CheckCircleOutlined className="mt-0.5" /> Admitted at the gate. This ticket can no longer be resold or reused.
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 gap-3">
          <Link to={ROUTE_PATHS.ticketDetails(ticket.tokenId)}>
            <Button block icon={<EyeOutlined />}>
              View
            </Button>
          </Link>
          {status === 'valid' && (
            <Link to={ROUTE_PATHS.listForResale(ticket.tokenId)}>
              <Button block type="primary" icon={<TagOutlined />}>
                Sell
              </Button>
            </Link>
          )}
          {status === 'listed' && <CancelListingButton tokenId={ticket.tokenId} onCancelled={onChanged} block />}
          {isUsed && (
            <Button block disabled icon={<TagOutlined />}>
              Sell
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
