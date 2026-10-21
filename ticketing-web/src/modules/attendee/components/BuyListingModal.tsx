import { SafetyCertificateOutlined, ShoppingCartOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import { InfoRow } from '@/components/InfoRow'
import { ModalShell } from '@/components/ModalShell'
import { TransactionStatus } from '@/components/TransactionStatus'
import { useTransaction } from '@/hooks/useTransaction'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { buyResale } from '@/services/resaleService'
import type { ListedTicket } from '@/types/ticketing'
import { formatEthWithSymbol, formatTokenId } from '@/utils/formatters'

interface BuyListingModalProps {
  ticket: ListedTicket | null
  onClose: () => void
  onPurchased: () => void
}

export function BuyListingModal({ ticket, onClose, onPurchased }: BuyListingModalProps) {
  const transaction = useTransaction()

  const handleClose = () => {
    transaction.reset()
    onClose()
  }

  const handleConfirm = async () => {
    if (!ticket) return
    const result = await transaction.execute(() => buyResale(ticket.tokenId, ticket.listing.price))
    if (result.ok) onPurchased()
  }

  const isConfirmed = transaction.status === 'confirmed'

  return (
    <ModalShell
      open={ticket !== null}
      onClose={handleClose}
      isLocked={transaction.isSubmitting}
      eyebrow="Capped resale · peer to peer"
      title={ticket ? `Buy ticket ${formatTokenId(ticket.tokenId)}` : 'Buy ticket'}
      icon={<ShoppingCartOutlined />}
      footer={
        isConfirmed ? (
          <Link to={ROUTE_PATHS.myTickets}>
            <Button type="primary" block>
              Go to my tickets
            </Button>
          </Link>
        ) : (
          <>
            <Button onClick={handleClose} disabled={transaction.isSubmitting}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              loading={transaction.isSubmitting}
              onClick={handleConfirm}
            >
              {ticket ? `Pay ${formatEthWithSymbol(ticket.listing.price)}` : 'Pay'}
            </Button>
          </>
        )
      }
    >
      {ticket && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">{ticket.event.name}</p>
          <div className="flex flex-col gap-2">
            <InfoRow label="Resale price" value={<EthAmount wei={ticket.listing.price} tone="warning" />} />
            <InfoRow label="Original face value" value={<EthAmount wei={ticket.facePrice} />} />
            <InfoRow label="Seller" value={<AddressText address={ticket.listing.seller} />} />
          </div>
          <div className="flex gap-3 rounded-xl border border-success/30 bg-success/5 p-3 text-xs text-muted">
            <SafetyCertificateOutlined className="mt-0.5 text-success-soft" />
            You pay exactly the listed price plus gas. The contract transfers the ticket to you and the ETH to the
            seller in the same transaction.
          </div>
          <TransactionStatus
            {...transaction}
            messages={{ confirmed: 'Purchase confirmed — the ticket is now in your wallet.' }}
          />
        </div>
      )}
    </ModalShell>
  )
}
