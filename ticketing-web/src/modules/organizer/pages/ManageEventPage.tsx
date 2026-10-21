import { Alert } from 'antd'
import { useParams } from 'react-router'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { EventSaleStatusPill } from '@/components/EventSaleStatusPill'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { PageHeader } from '@/components/PageHeader'
import { RefreshButton } from '@/components/RefreshButton'
import { useConnectedAddress } from '@/hooks/useWallet'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { parseIdParam, ROUTE_PATHS } from '@/routes/routePaths'
import { formatEventId, isSameAddress } from '@/utils/formatters'
import { EventRulesPanel } from '../components/EventRulesPanel'
import { SaleToggleButton } from '../components/SaleToggleButton'
import { TicketDistributionPanel } from '../components/TicketDistributionPanel'
import { ValidatorAccessPanel } from '../components/ValidatorAccessPanel'
import { useManagedEvent } from '../hooks/useManagedEvent'

function ManageEventContent({ eventId }: { eventId: bigint }) {
  const address = useConnectedAddress()
  const eventState = useManagedEvent(eventId)

  return (
    <AsyncContent state={eventState} errorTitle="Event unavailable">
      {({ event, stats, validators }) => {
        // UX only — the contract's onlyEventOrganiser modifier is the real guard.
        const isOrganiser = isSameAddress(event.organiser, address)

        return (
          <>
            <PageHeader
              meta={
                <>
                  <EventSaleStatusPill event={event} />
                  <span className="font-mono text-xs text-muted">ID: {formatEventId(event.eventId)}</span>
                </>
              }
              title={event.name}
              description="Smart contract administration"
              actions={
                <>
                  <RefreshButton onRefresh={eventState.reload} isRefreshing={eventState.isRefreshing} />
                  {isOrganiser && <SaleToggleButton event={event} onChanged={eventState.reload} />}
                </>
              }
            />

            {!isOrganiser && (
              <Alert
                className="mb-6!"
                type="info"
                showIcon
                title="Read-only view"
                description="Your wallet is not the organiser of this event, so sale controls and validator management are hidden."
              />
            )}

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="flex flex-col gap-6 lg:col-span-7">
                <EventRulesPanel event={event} />
                <TicketDistributionPanel event={event} stats={stats} />
              </div>
              <div className="lg:col-span-5">
                <ValidatorAccessPanel
                  eventId={event.eventId}
                  validators={validators}
                  canManage={isOrganiser}
                  onGranted={eventState.reload}
                />
              </div>
            </div>
          </>
        )
      }}
    </AsyncContent>
  )
}

export function ManageEventPage() {
  const eventId = parseIdParam(useParams().eventId)
  if (eventId === null) return <NotFoundPage />

  return (
    <>
      <PageBreadcrumb items={[{ label: 'Organizer', to: ROUTE_PATHS.organizerDashboard }, { label: `Event #${eventId}` }]} />
      <ManageEventContent eventId={eventId} />
    </>
  )
}
