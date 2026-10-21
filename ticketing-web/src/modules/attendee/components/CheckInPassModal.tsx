import { DownloadOutlined, QrcodeOutlined, ReloadOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { Alert, Button, Progress } from 'antd'
import { ModalShell } from '@/components/ModalShell'
import { appConfig } from '@/env/appConfig'
import { useSecondsUntil } from '@/hooks/useSecondsUntil'
import { formatCountdown, formatTokenId, shortenAddress } from '@/utils/formatters'
import { downloadDataUrl } from '@/utils/qrCode'
import { useCheckInPass } from '../hooks/useCheckInPass'

interface CheckInPassModalProps {
  open: boolean
  tokenId: bigint
  eventId: bigint
  eventName: string
  onClose: () => void
}

export function CheckInPassModal({ open, tokenId, eventId, eventName, onClose }: CheckInPassModalProps) {
  const { state, generate, reset } = useCheckInPass(tokenId, eventId)
  const qr = state.status === 'ready' ? state.qr : null
  const secondsLeft = useSecondsUntil(qr?.pass.expiresAt ?? null)
  const isExpired = secondsLeft === 0

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleDownload = () => {
    if (qr) downloadDataUrl(qr.qrDataUrl, `fairticket-check-in-ticket-${tokenId}.png`)
  }

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      isLocked={state.status === 'signing'}
      eyebrow={`Ticket ${formatTokenId(tokenId)} · ${eventName}`}
      title="Check-in QR"
      icon={<QrcodeOutlined />}
      tone="success"
    >
      {!qr && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Your wallet signs a one-time pass containing this ticket, its event, your address, a random nonce
            and a {appConfig.checkInQrTtlSeconds}-second expiry. Signing is free — no transaction is sent.
          </p>
          <ol className="flex flex-col gap-2 rounded-xl border border-line bg-surface-low/60 p-4 text-xs text-muted">
            <li>1. Sign the pass in MetaMask.</li>
            <li>2. Download the QR image.</li>
            <li>3. At the gate, staff upload it in the Gatekeeper validator before it expires.</li>
          </ol>
          {state.status === 'error' && <Alert type="error" showIcon title={state.message} />}
          <Button
            type="primary"
            size="large"
            block
            icon={<SafetyCertificateOutlined />}
            loading={state.status === 'signing'}
            onClick={generate}
          >
            {state.status === 'signing' ? 'Waiting for signature…' : 'Sign & generate QR'}
          </Button>
        </div>
      )}

      {qr && (
        <div className="flex flex-col items-center gap-4">
          <div
            className={`rounded-2xl border p-3 ${isExpired ? 'border-danger/40 opacity-40' : 'border-success/40 shadow-[0_0_24px_-2px_rgba(16,185,129,0.3)]'}`}
          >
            <img src={qr.qrDataUrl} alt={`Check-in QR for ticket ${tokenId}`} className="size-64 rounded-lg" />
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted">Holder {shortenAddress(qr.pass.holder)}</span>
              <span className={isExpired ? 'text-danger-soft' : 'text-success-soft'}>
                {isExpired ? 'Expired' : `Expires in ${formatCountdown(secondsLeft ?? appConfig.checkInQrTtlSeconds)}`}
              </span>
            </div>
            <Progress
              percent={((secondsLeft ?? appConfig.checkInQrTtlSeconds) / appConfig.checkInQrTtlSeconds) * 100}
              showInfo={false}
              size="small"
              status={isExpired ? 'exception' : 'active'}
              strokeColor={isExpired ? undefined : '#10B981'}
            />
          </div>

          {isExpired ? (
            <Button type="primary" block icon={<ReloadOutlined />} onClick={generate}>
              Generate a fresh QR
            </Button>
          ) : (
            <Button type="primary" block icon={<DownloadOutlined />} onClick={handleDownload}>
              Download QR image
            </Button>
          )}
          <p className="text-center text-xs text-subtle">
            Each QR can be scanned once. Screenshots stop working when the pass expires or the ticket changes hands.
          </p>
        </div>
      )}
    </ModalShell>
  )
}
