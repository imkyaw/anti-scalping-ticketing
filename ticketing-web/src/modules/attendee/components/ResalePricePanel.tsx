import { CheckCircleOutlined, ExclamationCircleOutlined, TagOutlined, ThunderboltOutlined } from '@ant-design/icons'
import { Button, InputNumber, Progress } from 'antd'
import { EthAmount } from '@/components/EthAmount'
import { GlassCard } from '@/components/GlassCard'
import { StatusPill } from '@/components/StatusPill'
import { formatEth, formatEthWithSymbol } from '@/utils/formatters'
import type { ResalePriceEvaluation } from '../utils/resalePrice'

interface ResalePricePanelProps {
  facePrice: bigint
  priceInput: string
  evaluation: ResalePriceEvaluation
  isUpdate: boolean
  isSubmitting: boolean
  disabled: boolean
  onPriceChange: (value: string) => void
  onSubmit: () => void
}

function PriceFeedback({ evaluation }: { evaluation: ResalePriceEvaluation }) {
  if (evaluation.price === null) return <span className="text-muted">Enter a price in ETH.</span>
  if (!evaluation.isPositive) return <span className="text-warning-soft">Price must be greater than 0.</span>
  if (!evaluation.isWithinCap) {
    return (
      <span className="flex items-center gap-1.5 text-danger-soft">
        <ExclamationCircleOutlined /> Above the face-value cap
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-success-soft">
      <CheckCircleOutlined /> Price permitted
    </span>
  )
}

export function ResalePricePanel({
  facePrice,
  priceInput,
  evaluation,
  isUpdate,
  isSubmitting,
  disabled,
  onPriceChange,
  onSubmit,
}: ResalePricePanelProps) {
  const ratio = evaluation.ratioPercent
  const discount = ratio !== null && ratio < 100 ? `Discount: -${(100 - ratio).toFixed(1)}%` : null

  return (
    <GlassCard
      eyebrow="Step 02 · input"
      title="Resale price"
      extra={<StatusPill tone="success">Live validation</StatusPill>}
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-xl border border-line bg-surface-low/60 p-4">
          <p className="label-caps text-muted">Face value (hard cap)</p>
          <EthAmount wei={facePrice} className="mt-2 block text-2xl" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="label-caps text-muted">Your resale price</span>
            <span className="font-mono text-xs text-warning-soft">
              {discount ?? `Max ${formatEthWithSymbol(facePrice)}`}
            </span>
          </div>
          <InputNumber<string>
            stringMode
            size="large"
            min="0"
            step="0.001"
            value={priceInput}
            onChange={(value) => onPriceChange(value ?? '')}
            disabled={disabled}
            placeholder={formatEth(facePrice)}
            suffix="ETH"
            status={evaluation.price !== null && !evaluation.isWithinCap ? 'error' : undefined}
            className="w-full! font-mono!"
          />
          <p className="mt-2 font-mono text-xs">
            <PriceFeedback evaluation={evaluation} />
          </p>
        </div>

        <div className="rounded-xl border border-line bg-surface-low/60 p-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-muted">Listing ratio</span>
            <span className={evaluation.isWithinCap ? 'text-success-soft' : 'text-danger-soft'}>
              {ratio === null ? '—' : `${ratio.toFixed(1)}% of face value`}
            </span>
          </div>
          <Progress
            percent={Math.min(ratio ?? 0, 100)}
            showInfo={false}
            size="small"
            status={evaluation.price !== null && !evaluation.isWithinCap ? 'exception' : 'normal'}
            strokeColor={evaluation.isWithinCap ? '#10B981' : undefined}
          />
          <Button
            type="link"
            size="small"
            className="mt-1 px-0!"
            icon={<ThunderboltOutlined />}
            disabled={disabled}
            onClick={() => onPriceChange(formatEth(facePrice, 18))}
          >
            Set to face value ({formatEthWithSymbol(facePrice)})
          </Button>
        </div>

        <Button
          type="primary"
          size="large"
          block
          icon={<TagOutlined />}
          loading={isSubmitting}
          disabled={disabled || evaluation.price === null}
          onClick={onSubmit}
        >
          {evaluation.price === null
            ? 'Enter a price'
            : `${isUpdate ? 'Update listing to' : 'List ticket for'} ${formatEthWithSymbol(evaluation.price)}`}
        </Button>
        <p className="text-center text-xs text-subtle">
          0% protocol fee. The buyer pays you directly in the resale transaction.
        </p>
      </div>
    </GlassCard>
  )
}
