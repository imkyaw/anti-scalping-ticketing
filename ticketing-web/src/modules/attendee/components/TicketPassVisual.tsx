import { QrcodeOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useState } from 'react'
import { AddressText } from '@/components/AddressText'
import { EthAmount } from '@/components/EthAmount'
import type { TicketStatus, TicketWithEvent } from '@/types/ticketing'
import { formatEventId, formatTokenId } from '@/utils/formatters'
import { CheckInPassModal } from './CheckInPassModal'

interface TicketPassVisualProps {
  ticket: TicketWithEvent
  status: TicketStatus
  isOwner: boolean
}

function CheckInZoneMessage({ status, isOwner }: { status: TicketStatus; isOwner: boolean }) {
  if (status === 'used') return <>This ticket was admitted at the gate and is permanently marked as used.</>
  if (!isOwner) return <>Only the current holder can generate a check-in QR.</>
  return <>Generate a signed, short-lived QR to present at the venue gate.</>
}

/** The signature ticket-pass card: event header, perforated divider, check-in zone. */
export function TicketPassVisual({ ticket, status, isOwner }: TicketPassVisualProps) {
  const [isQrOpen, setIsQrOpen] = useState(false)
  const canCheckIn = isOwner && status !== 'used'

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative bg-[radial-gradient(30rem_16rem_at_80%_0%,rgba(99,102,241,0.45),transparent_70%),radial-gradient(20rem_12rem_at_0%_100%,rgba(16,185,129,0.2),transparent_70%)] p-6">
        <div className="flex items-center justify-between">
          <span className="label-caps rounded-full bg-primary/20 px-2.5 py-1 text-primary-soft">General admission</span>
          <span className="font-mono text-xs text-muted">{formatEventId(ticket.eventId)}</span>
        </div>
        <h2 className="mt-12 text-2xl font-bold text-ink">{ticket.event.name}</h2>
        <p className="mt-1 font-mono text-xs text-muted">Ticket {formatTokenId(ticket.tokenId)}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6">
        <div>
          <p className="label-caps text-subtle">Holder</p>
          <AddressText address={ticket.owner} isSelf={isOwner} className="text-sm text-ink" />
        </div>
        <div className="text-right">
          <p className="label-caps text-subtle">Face value</p>
          <EthAmount wei={ticket.facePrice} className="text-sm" />
        </div>
      </div>

      <div className="ticket-divider mx-0" />

      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div
          className={`flex size-24 items-center justify-center rounded-2xl border text-4xl ${canCheckIn ? 'border-success/40 bg-success/10 text-success-soft' : 'border-line bg-surface-low text-subtle'}`}
        >
          <QrcodeOutlined />
        </div>
        <p className="max-w-xs text-xs text-muted">
          <CheckInZoneMessage status={status} isOwner={isOwner} />
        </p>
        {canCheckIn && (
          <Button type="primary" icon={<QrcodeOutlined />} onClick={() => setIsQrOpen(true)}>
            Generate check-in QR
          </Button>
        )}
        <div className="flex w-full items-center justify-between rounded-lg border border-line bg-surface-low/60 px-4 py-2 font-mono text-[11px] text-muted">
          <span>ERC-721 ID {ticket.tokenId.toString()}</span>
          <span>Non-transferable outside resale</span>
        </div>
      </div>

      <CheckInPassModal
        open={isQrOpen}
        tokenId={ticket.tokenId}
        eventId={ticket.eventId}
        eventName={ticket.event.name}
        onClose={() => setIsQrOpen(false)}
      />
    </div>
  )
}
