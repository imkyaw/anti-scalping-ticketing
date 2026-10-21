import {
  CheckCircleFilled,
  CloseCircleFilled,
  QrcodeOutlined,
  ReloadOutlined,
  StopOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Alert, Button } from 'antd'
import { TARGET_NETWORK } from '@/blockchain/networks'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { TransactionStatus } from '@/components/TransactionStatus'
import type { TransactionState } from '@/hooks/useTransaction'
import { useSecondsUntil } from '@/hooks/useSecondsUntil'
import { formatCountdown } from '@/utils/formatters'
import type { VerificationState } from '../hooks/useCheckInVerification'
import { ResultHeader } from './ResultHeader'
import { TicketFacts } from './TicketFacts'
import { VerificationChecks } from './VerificationChecks'

interface VerificationResultPanelProps {
  state: VerificationState
  admitTransaction: TransactionState & { isSubmitting: boolean }
  onAdmit: () => void
  onReject: () => void
  onReset: () => void
}

export function VerificationResultPanel({
  state,
  admitTransaction,
  onAdmit,
  onReject,
  onReset,
}: VerificationResultPanelProps) {
  const expiresAt = state.status === 'verified' ? state.verification.pass.expiresAt : null
  const secondsLeft = useSecondsUntil(expiresAt)

  if (state.status === 'idle') {
    return (
      <EmptyState
        icon={<QrcodeOutlined />}
        title="Awaiting a check-in QR"
        description="Upload the attendee's QR image to verify their signature and on-chain ticket state."
      />
    )
  }

  if (state.status === 'verifying') {
    return (
      <div className="glass-panel">
        <LoadingState message={`Verifying ${state.fileName}: signature, expiry and on-chain state…`} />
      </div>
    )
  }

  if (state.status === 'failed') {
    return <ErrorState title="Could not read this QR" message={state.message} onRetry={onReset} />
  }

  const { verification } = state
  const checkAnother = (
    <Button size="large" block icon={<ReloadOutlined />} onClick={onReset} disabled={admitTransaction.isSubmitting}>
      Check another ticket
    </Button>
  )

  if (state.status === 'admitted') {
    return (
      <section className="glass-card overflow-hidden border-success/40! shadow-[0_0_24px_-2px_rgba(16,185,129,0.3)]!">
        <ResultHeader
          tone="success"
          icon={<CheckCircleFilled />}
          title="Entry approved"
          subtitle="Ticket marked as used on-chain"
          tokenId={verification.pass.tokenId}
        />
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <TicketFacts verification={verification} statusLabel={<span className="text-muted">Used</span>} />
          <TransactionStatus {...admitTransaction} messages={{ confirmed: 'Check-in confirmed. Admit the attendee.' }} />
          {checkAnother}
        </div>
      </section>
    )
  }

  if (!verification.isValid) {
    return (
      <section className="glass-card overflow-hidden border-danger/40! shadow-[0_0_24px_-2px_rgba(239,68,68,0.3)]!">
        <ResultHeader
          tone="danger"
          icon={<CloseCircleFilled />}
          title="Entry denied"
          subtitle="Verification failed"
          tokenId={verification.pass.tokenId}
        />
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="rounded-xl border border-danger/30 bg-danger/10 p-4">
            <p className="label-caps flex items-center gap-2 text-danger-soft">
              <WarningOutlined /> Rejection cause
            </p>
            <p className="mt-2 text-base text-ink">{verification.rejectionReason}</p>
          </div>
          <TicketFacts
            verification={verification}
            statusLabel={
              verification.ticket?.isUsed ? <span className="text-danger-soft">Already used</span> : 'Not admitted'
            }
          />
          <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas/60 p-4">
            <StopOutlined className="mt-0.5 text-lg text-danger-soft" />
            <div>
              <p className="font-display text-lg font-semibold text-danger-soft">Do not admit</p>
              <p className="text-xs text-muted">
                {verification.ticket?.isUsed
                  ? 'Duplicate entry attempt — this ticket was already admitted. Refer the attendee to event staff.'
                  : 'Ask the attendee to generate a fresh QR from the wallet that holds the ticket.'}
              </p>
            </div>
          </div>
          <VerificationChecks checks={verification.checks} />
          {checkAnother}
        </div>
      </section>
    )
  }

  const isExpired = secondsLeft === 0

  return (
    <section className="glass-card overflow-hidden border-success/40! shadow-[0_0_24px_-2px_rgba(16,185,129,0.3)]!">
      <ResultHeader
        tone="success"
        icon={<CheckCircleFilled />}
        title="Valid ticket"
        subtitle="Cryptographic proof verified"
        tokenId={verification.pass.tokenId}
      />
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        <TicketFacts verification={verification} statusLabel={<span className="text-success-soft">● Unused</span>} />
        <div className="flex items-center justify-between rounded-lg border border-line bg-canvas/60 px-4 py-2 font-mono text-xs text-muted">
          <span>Authenticity: verified on {TARGET_NETWORK.name}</span>
          <span className={isExpired ? 'text-danger-soft' : 'text-success-soft'}>
            {isExpired ? 'Pass expired' : `Pass valid ${formatCountdown(secondsLeft ?? 0)}`}
          </span>
        </div>

        {isExpired ? (
          <Alert type="warning" showIcon title="The pass expired before entry was approved. Ask for a fresh QR." />
        ) : (
          <Button
            type="primary"
            size="large"
            block
            icon={<UserSwitchOutlined />}
            loading={admitTransaction.isSubmitting}
            onClick={onAdmit}
            className="h-14! bg-success! text-base! hover:bg-success/85!"
          >
            Admit & mark used (on-chain)
          </Button>
        )}
        <TransactionStatus {...admitTransaction} />

        <VerificationChecks checks={verification.checks} />
        <Button danger block onClick={onReject} disabled={admitTransaction.isSubmitting}>
          Refuse entry
        </Button>
      </div>
    </section>
  )
}
