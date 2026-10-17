import { CheckOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

interface ConnectStepProps {
  index: number
  title: ReactNode
  description: ReactNode
  isComplete: boolean
  isActive: boolean
  action?: ReactNode
}

export function ConnectStep({ index, title, description, isComplete, isActive, action }: ConnectStepProps) {
  const badgeClass = isComplete
    ? 'border-success/40 bg-success/15 text-success-soft'
    : isActive
      ? 'border-primary/50 bg-primary/15 text-primary-soft'
      : 'border-line bg-surface-low text-subtle'

  return (
    <li className={`flex gap-4 rounded-xl border p-4 ${isActive ? 'border-primary/30 bg-primary/5' : 'border-line'}`}>
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${badgeClass}`}
      >
        {isComplete ? <CheckOutlined /> : index}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${isActive || isComplete ? 'text-ink' : 'text-muted'}`}>{title}</p>
        <p className="mt-1 text-xs text-muted">{description}</p>
        {isActive && action && <div className="mt-3">{action}</div>}
      </div>
    </li>
  )
}
