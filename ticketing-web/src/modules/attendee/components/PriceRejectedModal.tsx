import { LockOutlined, StopOutlined, SyncOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { ModalShell } from '@/components/ModalShell'
import { formatEthWithSymbol } from '@/utils/formatters'

interface PriceRejectedModalProps {
  open: boolean
  facePrice: bigint
  attemptedPrice: bigint | null
  onReset: () => void
  onClose: () => void
}

/** The "price exceeded" pop-up from the Stitch design; the listing is blocked before any gas is spent. */
export function PriceRejectedModal({ open, facePrice, attemptedPrice, onReset, onClose }: PriceRejectedModalProps) {
  const markupPercent =
    attemptedPrice === null || facePrice === 0n
      ? null
      : Number(((attemptedPrice - facePrice) * 10_000n) / facePrice) / 100

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      tone="danger"
      icon={<StopOutlined />}
      eyebrow="Contract check · EVM revert"
      title="Price rejected"
      footer={
        <>
          <Button onClick={onClose}>Edit price</Button>
          <Button type="primary" icon={<SyncOutlined />} onClick={onReset}>
            Reset price to {formatEthWithSymbol(facePrice)}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 font-mono text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Face value</span>
            <span className="text-success-soft">{formatEthWithSymbol(facePrice)}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted">Resale price</span>
            <span className="text-danger-soft line-through">
              {attemptedPrice === null ? '—' : formatEthWithSymbol(attemptedPrice)}
            </span>
          </div>
          <p className="mt-4 text-xs text-danger-soft">
            ✕ Exceeds price cap{markupPercent !== null ? ` (+${markupPercent.toFixed(1)}%)` : ''} — cannot list above
            face value.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface-low/60 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-success-soft">
            <LockOutlined /> Protocol invariant enforced
          </p>
          <code className="mt-2 block rounded-md bg-canvas/70 px-3 py-2 font-mono text-xs text-primary-soft">
            require(price &lt;= ticketFacePrice[tokenId])
          </code>
          <p className="mt-2 text-xs text-muted">
            The smart contract reverts any listing above {formatEthWithSymbol(facePrice)}, so this transaction was not
            sent.
          </p>
        </div>
      </div>
    </ModalShell>
  )
}
