import { SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Alert, Button, InputNumber } from 'antd'
import { useState } from 'react'
import { Link } from 'react-router'
import { EthAmount } from '@/components/EthAmount'
import { GlassCard } from '@/components/GlassCard'
import { SupplyMeter } from '@/components/SupplyMeter'
import { TransactionStatus } from '@/components/TransactionStatus'
import { useTransaction } from '@/hooks/useTransaction'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { buyTicket } from '@/services/ticketService'
import type { TicketingEvent } from '@/types/ticketing'
import { formatEthWithSymbol } from '@/utils/formatters'

interface PurchasePanelProps {
  event: TicketingEvent
  purchasedCount: bigint
  onPurchased: () => void
}

function getBlockedReason(event: TicketingEvent, remainingForWallet: bigint): string | null {
  if (!event.saleOpen) return 'The organiser has closed ticket sales for this event.'
  if (event.sold >= event.supply) return 'This event is sold out.'
  if (remainingForWallet <= 0n) return 'You have reached the per-wallet purchase limit for this event.'
  return null
}

export function PurchasePanel({ event, purchasedCount, onPurchased }: PurchasePanelProps) {
  const transaction = useTransaction()
  const [quantity, setQuantity] = useState(1)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const available = event.supply - event.sold
  const remainingForWallet = event.perWalletCap - purchasedCount
  const maxQuantity = Number(available < remainingForWallet ? available : remainingForWallet)
  const blockedReason = getBlockedReason(event, remainingForWallet)
  const safeQuantity = Math.min(Math.max(quantity, 1), Math.max(maxQuantity, 1))
  const subtotal = event.facePrice * BigInt(safeQuantity)

  // The contract mints one ticket per buyTicket call, so N tickets = N transactions.
  const handleBuy = async () => {
    let completed = 0
    for (let index = 0; index < safeQuantity; index += 1) {
      setProgress({ done: completed, total: safeQuantity })
      const result = await transaction.execute(() => buyTicket(event.eventId, event.facePrice))
      if (!result.ok) break
      completed += 1
    }
    setProgress(completed > 0 ? { done: completed, total: safeQuantity } : null)
    setQuantity(1)
    if (completed > 0) onPurchased()
  }

  return (
    <GlassCard eyebrow="Ticket price" title="General admission" className="lg:sticky lg:top-28" tone="primary">
      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <p className="text-sm text-muted">Full event access · ERC-721 ticket</p>
          <EthAmount wei={event.facePrice} tone="warning" className="text-2xl sm:text-3xl" />
        </div>

        <div className="rounded-xl border border-line bg-surface-low/60 p-4">
          <p className="label-caps mb-3 flex items-center gap-2 text-muted">
            <span className="size-1.5 rounded-full bg-success" /> Supply telemetry
          </p>
          <SupplyMeter sold={event.sold} supply={event.supply} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div>
              <p className="text-subtle">Supply</p>
              <p className="text-ink">{event.supply.toString()}</p>
            </div>
            <div className="rounded-md bg-surface-high py-1">
              <p className="text-subtle">Sold</p>
              <p className="text-success-soft">{event.sold.toString()}</p>
            </div>
            <div>
              <p className="text-subtle">Available</p>
              <p className="text-warning-soft">{available.toString()}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
          <SafetyCertificateOutlined className="mt-0.5 text-lg text-success-soft" />
          <div>
            <p className="label-caps text-success-soft">Anti-scalping rule enforced</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Max {event.perWalletCap.toString()} per wallet. Resale is capped at face value (
              {formatEthWithSymbol(event.facePrice)}); the smart contract rejects higher listings.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label-caps text-muted">Quantity</span>
            <span className="font-mono text-xs text-muted">
              You bought {purchasedCount.toString()} / {event.perWalletCap.toString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface-low/60 p-3">
            <InputNumber
              min={1}
              max={Math.max(maxQuantity, 1)}
              value={safeQuantity}
              onChange={(value) => setQuantity(value ?? 1)}
              disabled={Boolean(blockedReason) || transaction.isSubmitting}
              mode="spinner"
              className="w-36!"
            />
            <div className="text-right">
              <p className="label-caps text-subtle">Subtotal</p>
              <EthAmount wei={subtotal} className="text-lg" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-line pt-4">
          <span className="text-base font-semibold text-ink">Total due</span>
          <span className="font-mono text-lg text-warning-soft">{formatEthWithSymbol(subtotal)} + gas</span>
        </div>

        {blockedReason ? (
          <Alert type="warning" showIcon title={blockedReason} />
        ) : (
          <Button
            type="primary"
            size="large"
            block
            icon={<ThunderboltOutlined />}
            loading={transaction.isSubmitting}
            onClick={handleBuy}
          >
            {transaction.isSubmitting && progress
              ? `Buying ticket ${progress.done + 1} of ${progress.total}…`
              : `Buy ${safeQuantity > 1 ? `${safeQuantity} tickets` : 'ticket'} (${formatEthWithSymbol(subtotal)})`}
          </Button>
        )}

        <TransactionStatus
          {...transaction}
          messages={{
            confirmed: progress ? `${progress.done} ticket(s) minted to your wallet.` : undefined,
          }}
        />
        {transaction.status === 'confirmed' && (
          <Link to={ROUTE_PATHS.myTickets} className="text-center text-sm">
            View my tickets →
          </Link>
        )}
      </div>
    </GlassCard>
  )
}
