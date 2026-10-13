import { SafetyCertificateOutlined, ShopOutlined } from '@ant-design/icons'
import { Button, Segmented } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router'
import { AddressText } from '@/components/AddressText'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ProtectionBanner } from '@/components/ProtectionBanner'
import { RefreshButton } from '@/components/RefreshButton'
import { StatusPill } from '@/components/StatusPill'
import { useConnectedAddress } from '@/hooks/useWallet'
import { ROUTE_PATHS } from '@/routes/routePaths'
import type { TicketStatus, TicketWithEvent } from '@/types/ticketing'
import { getTicketStatus } from '@/utils/ticketStatus'
import { TicketPassCard } from '../components/TicketPassCard'
import { useMyTickets } from '../hooks/useMyTickets'

type TicketFilter = 'all' | TicketStatus

function countByStatus(tickets: TicketWithEvent[]): Record<TicketStatus, number> {
  const counts: Record<TicketStatus, number> = { valid: 0, listed: 0, used: 0 }
  tickets.forEach((ticket) => {
    counts[getTicketStatus(ticket)] += 1
  })
  return counts
}

export function MyTicketsPage() {
  const address = useConnectedAddress()
  const ticketsState = useMyTickets(address)
  const [filter, setFilter] = useState<TicketFilter>('all')

  return (
    <>
      <section className="glass-card mb-8 flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <StatusPill tone="neutral">Portfolio vault</StatusPill>
            <StatusPill tone="success" dot pulse>
              Live on-chain
            </StatusPill>
          </div>
          <h1 className="text-3xl font-bold text-ink sm:text-4xl">My Tickets</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            ERC-721 passes held by <AddressText address={address} />
          </p>
        </div>
        <RefreshButton onRefresh={ticketsState.reload} isRefreshing={ticketsState.isRefreshing} />
      </section>

      <AsyncContent state={ticketsState} loadingMessage="Loading your tickets…">
        {(tickets) => {
          if (tickets.length === 0) {
            return (
              <EmptyState
                title="No tickets in this wallet"
                description="Buy a ticket from an event or pick one up on the resale marketplace."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link to={ROUTE_PATHS.events}>
                      <Button type="primary">Browse events</Button>
                    </Link>
                    <Link to={ROUTE_PATHS.marketplace}>
                      <Button icon={<ShopOutlined />}>Marketplace</Button>
                    </Link>
                  </div>
                }
              />
            )
          }

          const counts = countByStatus(tickets)
          const visibleTickets =
            filter === 'all' ? tickets : tickets.filter((ticket) => getTicketStatus(ticket) === filter)

          return (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Segmented<TicketFilter>
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { label: `All (${tickets.length})`, value: 'all' },
                    { label: `Valid (${counts.valid})`, value: 'valid' },
                    { label: `Listed (${counts.listed})`, value: 'listed' },
                    { label: `Used (${counts.used})`, value: 'used' },
                  ]}
                />
                <span className="flex items-center gap-2 font-mono text-xs text-muted">
                  <SafetyCertificateOutlined /> ERC-721 anti-scalp protocol
                </span>
              </div>

              {visibleTickets.length === 0 ? (
                <EmptyState title="Nothing here" description="No tickets match this filter." />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleTickets.map((ticket) => (
                    <TicketPassCard key={ticket.tokenId.toString()} ticket={ticket} onChanged={ticketsState.reload} />
                  ))}
                </div>
              )}
            </>
          )
        }}
      </AsyncContent>

      <div className="mt-10">
        <ProtectionBanner
          title="Anti-scalp protocol smart rules"
          description="Tickets can only change hands through the capped resale market. Listings above face value are rejected by the contract, and each ticket can be checked in exactly once."
        />
      </div>
    </>
  )
}
