import { Alert, Typography } from 'antd'
import type { ReactNode } from 'react'
import { getTransactionUrl } from '@/blockchain/networks'
import type { TransactionState, TransactionStatus as Status } from '@/hooks/useTransaction'
import { shortenAddress } from '@/utils/formatters'

interface TransactionStatusProps extends TransactionState {
  /** Override the default copy for any status. */
  messages?: Partial<Record<Status, ReactNode>>
  className?: string
}

const DEFAULT_MESSAGES: Record<Exclude<Status, 'idle'>, ReactNode> = {
  awaitingSignature: 'Confirm the transaction in MetaMask…',
  pending: 'Transaction submitted. Waiting for the block to be mined…',
  confirmed: 'Transaction confirmed on-chain.',
  cancelled: 'Transaction cancelled.',
  failed: 'Transaction failed.',
}

const ALERT_TYPES = {
  awaitingSignature: 'info',
  pending: 'info',
  confirmed: 'success',
  cancelled: 'warning',
  failed: 'error',
} as const

function TransactionHash({ hash }: { hash: string }) {
  const url = getTransactionUrl(hash)
  return (
    <span className="font-mono text-xs text-muted">
      Tx:{' '}
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          {shortenAddress(hash)}
        </a>
      ) : (
        <Typography.Text copyable={{ text: hash }} className="font-mono! text-xs! text-muted!">
          {shortenAddress(hash)}
        </Typography.Text>
      )}
    </span>
  )
}

export function TransactionStatus({ status, hash, error, messages, className = '' }: TransactionStatusProps) {
  if (status === 'idle') return null

  const title = messages?.[status] ?? (status === 'failed' && error ? error : DEFAULT_MESSAGES[status])

  return (
    <div className={className}>
      <Alert
        type={ALERT_TYPES[status]}
        showIcon
        title={title}
        description={hash ? <TransactionHash hash={hash} /> : undefined}
      />
    </div>
  )
}
