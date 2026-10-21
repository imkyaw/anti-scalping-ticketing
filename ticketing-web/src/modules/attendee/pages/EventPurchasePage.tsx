import { SafetyCertificateOutlined } from '@ant-design/icons'
import { useParams } from 'react-router'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { StatusPill } from '@/components/StatusPill'
import { EventSaleStatusPill } from '@/components/EventSaleStatusPill'
import { useConnectedAddress } from '@/hooks/useWallet'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { parseIdParam, ROUTE_PATHS } from '@/routes/routePaths'
import { EventOverviewCard } from '../components/EventOverviewCard'
import { PurchasePanel } from '../components/PurchasePanel'
import { useEventPurchase } from '../hooks/useEventPurchase'

function EventPurchaseContent({ eventId }: { eventId: bigint }) {
  const address = useConnectedAddress()
  const purchaseState = useEventPurchase(eventId, address)

  return (
    <AsyncContent state={purchaseState} errorTitle="Event unavailable">
      {({ event, purchasedCount }) => (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <EventSaleStatusPill event={event} />
              <StatusPill tone="neutral" icon={<SafetyCertificateOutlined />}>
                Anti-scalping protected
              </StatusPill>
            </div>
            <span className="font-mono text-xs text-muted">Max {event.perWalletCap.toString()} per wallet</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <EventOverviewCard event={event} />
            </div>
            <div className="lg:col-span-5">
              <PurchasePanel event={event} purchasedCount={purchasedCount} onPurchased={purchaseState.reload} />
            </div>
          </div>
        </>
      )}
    </AsyncContent>
  )
}

export function EventPurchasePage() {
  const eventId = parseIdParam(useParams().eventId)
  if (eventId === null) return <NotFoundPage />

  return (
    <>
      <PageBreadcrumb items={[{ label: 'Events', to: ROUTE_PATHS.events }, { label: `Event #${eventId}` }]} />
      <EventPurchaseContent eventId={eventId} />
    </>
  )
}
