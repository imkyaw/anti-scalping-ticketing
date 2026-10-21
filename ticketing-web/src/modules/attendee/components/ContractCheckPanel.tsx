import { CheckCircleFilled, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons'
import { CheckList } from '@/components/CheckList'
import { GlassCard } from '@/components/GlassCard'
import { formatEthWithSymbol } from '@/utils/formatters'
import type { ResalePriceEvaluation } from '../utils/resalePrice'

interface ContractCheckPanelProps {
  facePrice: bigint | null
  evaluation: ResalePriceEvaluation
  isTicketEligible: boolean
}

function Verdict({ evaluation }: { evaluation: ResalePriceEvaluation }) {
  if (evaluation.price === null || !evaluation.isPositive) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-low/60 px-4 py-3 font-mono text-sm text-muted">
        <ClockCircleOutlined /> Awaiting a price
      </div>
    )
  }
  if (!evaluation.isWithinCap) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 font-mono text-sm text-warning-soft">
        <WarningOutlined /> Would revert on-chain
      </div>
    )
  }
  return (
    <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/10 px-4 py-3 font-mono text-sm text-success-soft">
      <span className="flex items-center gap-2">
        <CheckCircleFilled /> Price allowed
      </span>
      <span className="label-caps rounded bg-canvas/60 px-2 py-1">Safe</span>
    </div>
  )
}

/** Mirrors what ResaleMarket.listForResale will check, before any gas is spent. */
export function ContractCheckPanel({ facePrice, evaluation, isTicketEligible }: ContractCheckPanelProps) {
  const delta = evaluation.deltaWei
  const deltaLabel =
    delta === null || evaluation.ratioPercent === null
      ? '—'
      : `${delta > 0n ? '+' : delta < 0n ? '-' : ''}${formatEthWithSymbol(delta < 0n ? -delta : delta)} (${(evaluation.ratioPercent - 100).toFixed(1)}%)`

  return (
    <GlassCard eyebrow="Step 03 · oracle" title="Contract check">
      <div className="flex flex-col gap-5">
        <Verdict evaluation={evaluation} />

        <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-low/60 p-4 font-mono text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Face value</span>
            <span className="text-ink">{facePrice === null ? '—' : formatEthWithSymbol(facePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Resale price</span>
            <span className={evaluation.isWithinCap ? 'text-success-soft' : 'text-warning-soft'}>
              {evaluation.price === null ? '—' : formatEthWithSymbol(evaluation.price)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Delta</span>
            <span className={delta !== null && delta > 0n ? 'text-warning-soft' : 'text-success-soft'}>{deltaLabel}</span>
          </div>
        </div>

        <CheckList
          items={[
            {
              key: 'owner',
              label: 'Seller owns an unused ticket',
              passed: isTicketEligible,
            },
            {
              key: 'positive',
              label: 'Price greater than 0',
              passed: evaluation.price === null ? null : evaluation.isPositive,
            },
            {
              key: 'cap',
              label: 'Within price cap',
              passed: evaluation.price === null ? null : evaluation.isWithinCap,
              detail: 'require(price <= ticketFacePrice[tokenId])',
            },
          ]}
        />
      </div>
    </GlassCard>
  )
}
