import { CalendarOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Input, Segmented } from 'antd'
import { useState } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { FilterBar } from '@/components/FilterBar'
import { PageHeader } from '@/components/PageHeader'
import { RefreshButton } from '@/components/RefreshButton'
import { StatusPill } from '@/components/StatusPill'
import type { TicketingEvent } from '@/types/ticketing'
import { EventCard } from '../components/EventCard'
import { useEvents } from '../hooks/useEvents'

type EventFilter = 'all' | 'onSale' | 'unavailable'

const isOnSale = (event: TicketingEvent) => event.saleOpen && event.sold < event.supply

function filterEvents(events: TicketingEvent[], filter: EventFilter, search: string): TicketingEvent[] {
  const query = search.trim().toLowerCase()
  return events
    .filter((event) => filter === 'all' || (filter === 'onSale' ? isOnSale(event) : !isOnSale(event)))
    .filter((event) => !query || event.name.toLowerCase().includes(query))
}

export function EventsPage() {
  const eventsState = useEvents()
  const [filter, setFilter] = useState<EventFilter>('all')
  const [search, setSearch] = useState('')

  return (
    <>
      <PageHeader
        meta={
          <>
            <StatusPill tone="success" dot>
              Contract verified · ERC-721
            </StatusPill>
            <StatusPill tone="neutral" icon={<SafetyCertificateOutlined />}>
              Anti-scalping protected
            </StatusPill>
          </>
        }
        eyebrow="Primary sale · face value only"
        title="Events"
        description="Every event below lives on the EventTicketing contract. Tickets are minted to your wallet at face value, with a per-wallet cap set by the organiser."
        actions={<RefreshButton onRefresh={eventsState.reload} isRefreshing={eventsState.isRefreshing} />}
      />

      <AsyncContent state={eventsState} loadingMessage="Loading events from the contract…">
        {(events) => {
          if (events.length === 0) {
            return (
              <EmptyState
                icon={<CalendarOutlined />}
                title="No events yet"
                description="Events appear here once the organiser creates them."
              />
            )
          }

          const visibleEvents = filterEvents(events, filter, search)
          return (
            <>
              <FilterBar summary={`Showing ${visibleEvents.length} of ${events.length}`}>
                <Segmented<EventFilter>
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'On sale', value: 'onSale' },
                    { label: 'Closed / sold out', value: 'unavailable' },
                  ]}
                />
                <Input.Search
                  allowClear
                  placeholder="Search events"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="sm:w-64!"
                />
              </FilterBar>

              {visibleEvents.length === 0 ? (
                <EmptyState title="No matching events" description="Try a different filter or search term." />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleEvents.map((event) => (
                    <EventCard key={event.eventId.toString()} event={event} />
                  ))}
                </div>
              )}
            </>
          )
        }}
      </AsyncContent>
    </>
  )
}
