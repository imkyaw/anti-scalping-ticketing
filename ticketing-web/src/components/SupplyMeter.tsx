import { Progress } from 'antd'
import { toPercent } from '@/utils/formatters'

interface SupplyMeterProps {
  sold: bigint
  supply: bigint
}

export function SupplyMeter({ sold, supply }: SupplyMeterProps) {
  const percent = toPercent(sold, supply)
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-muted">
          <span className="text-ink">{sold.toString()}</span> / {supply.toString()} sold
        </span>
        <span className="text-success-soft">{percent.toFixed(0)}% minted</span>
      </div>
      <Progress
        percent={percent}
        showInfo={false}
        size="small"
        strokeColor={{ from: '#10B981', to: '#6366F1' }}
        railColor="var(--color-line)"
      />
    </div>
  )
}
