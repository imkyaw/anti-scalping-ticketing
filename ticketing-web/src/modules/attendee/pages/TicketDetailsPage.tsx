import { RobotOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { useParams } from 'react-router'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { FeatureTile } from '@/components/FeatureTile'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { StatusPill } from '@/components/StatusPill'
import { useConnectedAddress } from '@/hooks/useWallet'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { parseIdParam, ROUTE_PATHS } from '@/routes/routePaths'
import { formatEthWithSymbol, formatTokenId, isSameAddress, shortenAddress } from '@/utils/formatters'
import { getTicketStatus } from '@/utils/ticketStatus'
import { TicketContractParameters } from '../components/TicketContractParameters'
import { TicketHistoryTimeline } from '../components/TicketHistoryTimeline'
import { TicketPassVisual } from '../components/TicketPassVisual'
import { TicketStatusPill } from '../components/TicketStatusPill'
import { useTicketDetails } from '../hooks/useTicketDetails'

function TicketDetailsContent({ tokenId }: { tokenId: bigint }) {
  const address = useConnectedAddress()
  const detailsState = useTicketDetails(tokenId)

  return (
    <AsyncContent state={detailsState} errorTitle="Ticket unavailable">
      {({ ticket, history }) => {
        const status = getTicketStatus(ticket)
        const isOwner = isSameAddress(ticket.owner, address)

        return (
          <>
            <header className="mb-8">
              <p className="label-caps mb-2 text-success-soft">Consensus secured · ERC-721</p>
              <h1 className="text-3xl font-bold text-ink sm:text-4xl">
                Ticket {formatTokenId(ticket.tokenId)} <span className="text-muted">—</span> {ticket.event.name}
              </h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill tone="success" icon={<SafetyCertificateOutlined />}>
                  Authentic contract ticket
                </StatusPill>
                <StatusPill tone={isOwner ? 'primary' : 'neutral'}>
                  {isOwner ? 'Owned by you' : `Owned by ${shortenAddress(ticket.owner)}`}
                </StatusPill>
                <TicketStatusPill status={status} />
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <TicketPassVisual ticket={ticket} status={status} isOwner={isOwner} />
              </div>
              <div className="flex flex-col gap-6 lg:col-span-7">
                <TicketContractParameters
                  ticket={ticket}
                  status={status}
                  isOwner={isOwner}
                  onChanged={detailsState.reload}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FeatureTile
                    icon={<RobotOutlined />}
                    title="Bot protection"
                    description={`Each wallet may buy at most ${ticket.event.perWalletCap.toString()} ticket(s) for this event at primary sale.`}
                    tone="primary"
                  />
                  <FeatureTile
                    icon={<SafetyCertificateOutlined />}
                    title="100% guaranteed face value"
                    description={`Resale can never exceed ${formatEthWithSymbol(ticket.facePrice)}. Direct transfers outside the marketplace are blocked.`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <TicketHistoryTimeline history={history} />
            </div>
          </>
        )
      }}
    </AsyncContent>
  )
}

export function TicketDetailsPage() {
  const tokenId = parseIdParam(useParams().tokenId)
  if (tokenId === null) return <NotFoundPage />

  return (
    <>
      <PageBreadcrumb items={[{ label: 'My Tickets', to: ROUTE_PATHS.myTickets }, { label: `Ticket ${formatTokenId(tokenId)}` }]} />
      <TicketDetailsContent tokenId={tokenId} />
    </>
  )
}
