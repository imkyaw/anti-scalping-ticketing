import type { ReactNode } from 'react'
import { TONE_TEXT_CLASSES, type Tone } from '@/theme/tones'

interface InfoRowProps {
  label: ReactNode
  value: ReactNode
  hint?: ReactNode
  icon?: ReactNode
  tone?: Tone
}

/** Label / value row used in contract-parameter and detail lists. */
export function InfoRow({ label, value, hint, icon, tone = 'neutral' }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-line bg-surface-low/60 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3 text-sm text-muted">
        {icon && <span className="text-base text-subtle">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="min-w-0 text-right">
        <div className={`truncate font-mono text-sm font-medium ${TONE_TEXT_CLASSES[tone]}`}>{value}</div>
        {hint && <div className="mt-0.5 font-mono text-[11px] text-subtle">{hint}</div>}
      </div>
    </div>
  )
}
