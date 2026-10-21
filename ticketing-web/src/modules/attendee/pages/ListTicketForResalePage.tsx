import { TagOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { AsyncContent } from '@/components/feedback/AsyncContent'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { ProtectionBanner } from '@/components/ProtectionBanner'
import { StatusPill } from '@/components/StatusPill'
import { TransactionStatus } from '@/components/TransactionStatus'
import { useTransaction } from '@/hooks/useTransaction'
import { useConnectedAddress } from '@/hooks/useWallet'
import { parseIdParam, ROUTE_PATHS } from '@/routes/routePaths'
import { listForResale } from '@/services/resaleService'
import type { TicketWithEvent } from '@/types/ticketing'
import { parseEthInput } from '@/utils/ethInput'
import { formatEth, formatEthWithSymbol } from '@/utils/formatters'
import { hasActiveListing } from '@/utils/ticketStatus'
import { ContractCheckPanel } from '../components/ContractCheckPanel'
import { MarketplaceTabs } from '../components/MarketplaceTabs'
import { PriceRejectedModal } from '../components/PriceRejectedModal'
import { ResalePricePanel } from '../components/ResalePricePanel'
import { ResaleTicketPanel } from '../components/ResaleTicketPanel'
import { useMyTickets } from '../hooks/useMyTickets'
import { evaluateResalePrice } from '../utils/resalePrice'

interface ResaleListingFormProps {
  tickets: TicketWithEvent[]
  initialTokenId: bigint | null
  onListed: () => void
}

function ResaleListingForm({ tickets, initialTokenId, onListed }: ResaleListingFormProps) {
  const { message } = App.useApp()
  const transaction = useTransaction()
  const [selectedTokenId, setSelectedTokenId] = useState<bigint | null>(
    tickets.some((ticket) => ticket.tokenId === initialTokenId) ? initialTokenId : (tickets[0]?.tokenId ?? null),
  )
  const [priceInput, setPriceInput] = useState('')
  const [isRejectedOpen, setIsRejectedOpen] = useState(false)

  const selected = tickets.find((ticket) => ticket.tokenId === selectedTokenId) ?? null
  const facePrice = selected?.facePrice ?? 0n
  const evaluation = useMemo(() => evaluateResalePrice(parseEthInput(priceInput), facePrice), [priceInput, facePrice])

  const handleSelect = (tokenId: bigint) => {
    setSelectedTokenId(tokenId)
    setPriceInput('')
    transaction.reset()
  }

  const handleSubmit = async () => {
    if (!selected || evaluation.price === null) return
    if (!evaluation.isPositive) {
      message.warning('Resale price must be greater than 0.')
      return
    }
    if (!evaluation.isWithinCap) {
      setIsRejectedOpen(true)
      return
    }
    const price = evaluation.price
    const result = await transaction.execute(() => listForResale(selected.tokenId, price))
    if (result.ok) {
      message.success(`Ticket listed for ${formatEthWithSymbol(price)}`)
      onListed()
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <ResaleTicketPanel tickets={tickets} selected={selected} onSelect={handleSelect} />
        <ResalePricePanel
          facePrice={facePrice}
          priceInput={priceInput}
          evaluation={evaluation}
          isUpdate={selected ? hasActiveListing(selected) : false}
          isSubmitting={transaction.isSubmitting}
          disabled={!selected || transaction.isSubmitting}
          onPriceChange={setPriceInput}
          onSubmit={handleSubmit}
        />
        <ContractCheckPanel
          facePrice={selected?.facePrice ?? null}
          evaluation={evaluation}
          isTicketEligible={Boolean(selected && !selected.isUsed)}
        />
      </div>

      <TransactionStatus
        {...transaction}
        className="mt-6"
        messages={{ confirmed: 'Listing confirmed on-chain. Buyers can now purchase it on the marketplace.' }}
      />

      <PriceRejectedModal
        open={isRejectedOpen}
        facePrice={facePrice}
        attemptedPrice={evaluation.price}
        onClose={() => setIsRejectedOpen(false)}
        onReset={() => {
          setPriceInput(formatEth(facePrice, 18))
          setIsRejectedOpen(false)
        }}
      />
    </>
  )
}

export function ListTicketForResalePage() {
  const address = useConnectedAddress()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const ticketsState = useMyTickets(address)
  const initialTokenId = parseIdParam(searchParams.get('tokenId'))

  return (
    <>
      <MarketplaceTabs />
      <PageHeader
        eyebrow="Anti-scalp protocol verification pipeline"
        title="List Ticket for Resale"
        description="Contract-mandated zero-scalping exchange. Every listing is checked on-chain against the ticket's original face value."
        actions={<StatusPill tone="success">Rule: resale ≤ face value</StatusPill>}
      />

      <AsyncContent state={ticketsState} loadingMessage="Loading your tickets…">
        {(tickets) => {
          const eligible = tickets.filter((ticket) => !ticket.isUsed)
          if (eligible.length === 0) {
            return (
              <EmptyState
                icon={<TagOutlined />}
                title="No tickets to sell"
                description="You need an unused ticket in this wallet to create a resale listing."
                action={
                  <Link to={ROUTE_PATHS.events}>
                    <Button type="primary">Browse events</Button>
                  </Link>
                }
              />
            )
          }
          return (
            <ResaleListingForm
              key={address}
              tickets={eligible}
              initialTokenId={initialTokenId}
              onListed={() => navigate(ROUTE_PATHS.marketplace)}
            />
          )
        }}
      </AsyncContent>

      <div className="mt-10">
        <ProtectionBanner
          title="Smart contract invariant guarantee"
          description="Listings above the original face value are rejected by the EVM during execution. The price check on this page only saves you a failed transaction."
        />
      </div>
    </>
  )
}
