import type { ReactNode } from 'react'
import { TONE_TEXT_CLASSES, type Tone } from '@/theme/tones'

interface StatTileProps {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  tone?: Tone
}

export function StatTile({ label, value, hint, icon, tone = 'neutral' }: StatTileProps) {
  return (
    <div className="glass-panel flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="label-caps text-muted">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className={`font-mono text-xl font-medium ${TONE_TEXT_CLASSES[tone]}`}>{value}</div>
      {hint && <div className="text-xs text-subtle">{hint}</div>}
    </div>
  )
}
