import { ArrowDownOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import { StatusPill } from '@/components/StatusPill'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { ListedTicket } from '@/types/ticketing'
import { formatEthWithSymbol, formatTokenId, toPercent } from '@/utils/formatters'
import { CancelListingButton } from './CancelListingButton'

interface ListingCardProps {
  ticket: ListedTicket
  isOwnListing: boolean
  onBuy: () => void
  onChanged: () => void
}

export function ListingCard({ ticket, isOwnListing, onBuy, onChanged }: ListingCardProps) {
  const { listing } = ticket
  const isDiscounted = listing.price < ticket.facePrice
  const discountPercent = 100 - toPercent(listing.price, ticket.facePrice)

  return (
    <article
      className={`glass-card flex flex-col gap-4 border-t-2! p-5 ${isDiscounted ? 'border-t-success!' : 'border-t-primary!'}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-primary-soft">TICKET {formatTokenId(ticket.tokenId)}</span>
        <StatusPill tone="success" dot>
          Price verified
        </StatusPill>
      </div>

      <div>
        <h3 className="truncate text-lg font-semibold text-ink">{ticket.event.name}</h3>
        <div className="mt-2">
          {isDiscounted ? (
            <StatusPill tone="success" icon={<ArrowDownOutlined />}>
              {discountPercent.toFixed(1)}% under face value
            </StatusPill>
          ) : (
            <StatusPill tone="primary">Exactly at face value</StatusPill>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface-low/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">Resale price</span>
          <EthAmount wei={listing.price} tone={isDiscounted ? 'success' : 'neutral'} className="text-lg" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-xs text-subtle">Face value</span>
          <EthAmount wei={ticket.facePrice} strikethrough={isDiscounted} className="text-xs text-muted!" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>Seller</span>
        <AddressText address={listing.seller} isSelf={isOwnListing} />
      </div>

      <div className="mt-auto flex flex-col gap-2">
        {isOwnListing ? (
          <CancelListingButton tokenId={ticket.tokenId} onCancelled={onChanged} block />
        ) : (
          <Button
            type="primary"
            block
            size="large"
            icon={<ThunderboltOutlined />}
            iconPlacement="end"
            onClick={onBuy}
          >
            Buy for {formatEthWithSymbol(listing.price)}
          </Button>
        )}
        <Link to={ROUTE_PATHS.ticketDetails(ticket.tokenId)}>
          <Button block type="text" icon={<EyeOutlined />} className="text-muted!">
            View ticket
          </Button>
        </Link>
      </div>
    </article>
  )
}
