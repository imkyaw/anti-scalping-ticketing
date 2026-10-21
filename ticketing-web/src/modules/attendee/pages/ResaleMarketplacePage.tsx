import {
  ArrowDownOutlined,
  FireOutlined,
  PlusCircleOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Button, Select } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { EmptyState } from '@/components/feedback/EmptyState'
import { FilterBar } from '@/components/FilterBar'
import { PageHeader } from '@/components/PageHeader'
import { ProtectionBanner } from '@/components/ProtectionBanner'
import { RefreshButton } from '@/components/RefreshButton'
import { StatTile } from '@/components/StatTile'
import { StatusPill } from '@/components/StatusPill'
import { useConnectedAddress } from '@/hooks/useWallet'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { ListedTicket } from '@/types/ticketing'
import { formatEthWithSymbol, isSameAddress } from '@/utils/formatters'
import { BuyListingModal } from '../components/BuyListingModal'
import { ListingCard } from '../components/ListingCard'
import { MarketplaceTabs } from '../components/MarketplaceTabs'
import { useResaleListings } from '../hooks/useResaleListings'

type SortOrder = 'priceAsc' | 'priceDesc' | 'newest'

const ALL_EVENTS = 'all'

function sortListings(listings: ListedTicket[], order: SortOrder): ListedTicket[] {
  return [...listings].sort((a, b) => {
    if (order === 'newest') return Number(b.tokenId - a.tokenId)
    const difference = a.listing.price - b.listing.price
    const ascending = difference < 0n ? -1 : difference > 0n ? 1 : 0
    return order === 'priceAsc' ? ascending : -ascending
  })
}

function MarketplaceStats({ listings }: { listings: ListedTicket[] }) {
  const floor = listings.reduce<bigint | null>(
    (lowest, ticket) => (lowest === null || ticket.listing.price < lowest ? ticket.listing.price : lowest),
    null,
  )
  const eventCount = new Set(listings.map((ticket) => ticket.eventId)).size

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile label="Active listings" value={listings.length} hint="Tickets available now" icon={<TagOutlined />} />
      <StatTile
        label="Current floor"
        value={floor === null ? '—' : formatEthWithSymbol(floor)}
        tone="success"
        icon={<ArrowDownOutlined />}
      />
      <StatTile label="Events" value={eventCount} hint="With resale supply" icon={<FireOutlined />} />
      <StatTile
        label="Max markup"
        value="0%"
        hint="Hard ceiling at face value"
        tone="primary"
        icon={<SafetyCertificateOutlined />}
      />
    </div>
  )
}

export function ResaleMarketplacePage() {
  const address = useConnectedAddress()
  const listingsState = useResaleListings()
  const [eventFilter, setEventFilter] = useState<string>(ALL_EVENTS)
  const [sortOrder, setSortOrder] = useState<SortOrder>('priceAsc')
  const [buying, setBuying] = useState<ListedTicket | null>(null)

  const listings = listingsState.data ?? []
  const eventOptions = [
    { value: ALL_EVENTS, label: 'All events' },
    ...[...new Map(listings.map((ticket) => [ticket.eventId.toString(), ticket.event.name])).entries()].map(
      ([value, label]) => ({ value, label }),
    ),
  ]

  return (
    <>
      <PageHeader
        meta={
          <>
            <StatusPill tone="success">100% on-chain cap</StatusPill>
            <StatusPill tone="neutral">Peer-to-peer resale</StatusPill>
          </>
        }
        title="Resale Marketplace"
        description="Verified secondary sales. The smart contract guarantees tickets are never resold above their original face value."
        actions={
          <>
            <Link to={ROUTE_PATHS.listForResale()}>
              <Button type="primary" icon={<PlusCircleOutlined />}>
                List a ticket
              </Button>
            </Link>
            <RefreshButton onRefresh={listingsState.reload} isRefreshing={listingsState.isRefreshing} />
          </>
        }
      />

      <div className="mb-8">
        <ProtectionBanner
          title="Protected by the FairTicket anti-scalping contract"
          description="Resale prices are capped at the ticket's original face value. Speculative markups revert on-chain, and tickets cannot be transferred outside this marketplace."
        />
      </div>

      <MarketplaceTabs listingCount={listingsState.data?.length} />

      <AsyncContent state={listingsState} loadingMessage="Scanning the contract for active listings…">
        {() => {
          const visible = sortListings(
            eventFilter === ALL_EVENTS ? listings : listings.filter((ticket) => ticket.eventId.toString() === eventFilter),
            sortOrder,
          )

          return (
            <>
              <MarketplaceStats listings={listings} />
              <FilterBar summary={`Showing ${visible.length} of ${listings.length} listings`}>
                <Select value={eventFilter} onChange={setEventFilter} options={eventOptions} className="sm:w-56!" />
                <Select<SortOrder>
                  value={sortOrder}
                  onChange={setSortOrder}
                  className="sm:w-52!"
                  options={[
                    { value: 'priceAsc', label: 'Lowest price first' },
                    { value: 'priceDesc', label: 'Highest price first' },
                    { value: 'newest', label: 'Newest ticket first' },
                  ]}
                />
              </FilterBar>

              {visible.length === 0 ? (
                <EmptyState
                  icon={<ShopOutlined />}
                  title="No tickets listed"
                  description="When holders list tickets for resale they will appear here."
                />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {visible.map((ticket) => (
                    <ListingCard
                      key={ticket.tokenId.toString()}
                      ticket={ticket}
                      isOwnListing={isSameAddress(ticket.listing.seller, address)}
                      onBuy={() => setBuying(ticket)}
                      onChanged={listingsState.reload}
                    />
                  ))}
                </div>
              )}
            </>
          )
        }}
      </AsyncContent>

      <BuyListingModal ticket={buying} onClose={() => setBuying(null)} onPurchased={listingsState.reload} />
    </>
  )
}
