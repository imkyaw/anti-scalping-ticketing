import { CalendarOutlined, CheckCircleOutlined, PlusOutlined, TagsOutlined, WalletOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { AddressText } from '@/components/AddressText'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { RefreshButton } from '@/components/RefreshButton'
import { StatTile } from '@/components/StatTile'
import { StatusPill } from '@/components/StatusPill'
import { useConnectedAddress } from '@/hooks/useWallet'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { formatEthWithSymbol } from '@/utils/formatters'
import { ManagedEventCard } from '../components/ManagedEventCard'
import { useOrganizerEvents } from '../hooks/useOrganizerEvents'

export function OrganizerDashboardPage() {
  const address = useConnectedAddress()
  const eventsState = useOrganizerEvents(address)

  return (
    <>
      <PageHeader
        meta={
          <>
            <StatusPill tone="success" dot pulse>
              Synced
            </StatusPill>
            <StatusPill tone="warning">Anti-scalp protocol active</StatusPill>
          </>
        }
        title="Organizer Dashboard"
        description={
          <span className="flex flex-wrap items-center gap-2">
            Events created by <AddressText address={address} isSelf />
          </span>
        }
        actions={
          <>
            <RefreshButton onRefresh={eventsState.reload} isRefreshing={eventsState.isRefreshing} />
            <Link to={ROUTE_PATHS.createEvent}>
              <Button type="primary" icon={<PlusOutlined />}>
                Create event
              </Button>
            </Link>
          </>
        }
      />

      <AsyncContent state={eventsState} loadingMessage="Loading your events…">
        {(managed) => {
          if (managed.length === 0) {
            return (
              <EmptyState
                icon={<CalendarOutlined />}
                title="You have not created any events"
                description="Any wallet can create an event and becomes its organiser. Set the face price, supply and per-wallet cap — the contract enforces them."
                action={
                  <Link to={ROUTE_PATHS.createEvent}>
                    <Button type="primary" icon={<PlusOutlined />}>
                      Create your first event
                    </Button>
                  </Link>
                }
              />
            )
          }

          const totals = managed.reduce(
            (sum, { stats }) => ({
              sold: sum.sold + stats.sold,
              checkedIn: sum.checkedIn + stats.checkedIn,
              revenue: sum.revenue + stats.primaryRevenue,
            }),
            { sold: 0n, checkedIn: 0n, revenue: 0n },
          )

          return (
            <>
              <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatTile label="Managed events" value={managed.length} icon={<CalendarOutlined />} />
                <StatTile label="Tickets sold" value={totals.sold.toString()} icon={<TagsOutlined />} tone="primary" />
                <StatTile
                  label="Checked in"
                  value={totals.checkedIn.toString()}
                  icon={<CheckCircleOutlined />}
                  tone="success"
                />
                <StatTile
                  label="Primary revenue"
                  value={formatEthWithSymbol(totals.revenue)}
                  icon={<WalletOutlined />}
                  tone="warning"
                />
              </div>

              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
                  <CalendarOutlined className="text-primary-soft" /> Managed events
                </h2>
                <span className="font-mono text-xs text-muted">{managed.length} on-chain</span>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {managed.map(({ event, stats }) => (
                  <ManagedEventCard
                    key={event.eventId.toString()}
                    event={event}
                    stats={stats}
                    onChanged={eventsState.reload}
                  />
                ))}
              </div>
            </>
          )
        }}
      </AsyncContent>
    </>
  )
}
