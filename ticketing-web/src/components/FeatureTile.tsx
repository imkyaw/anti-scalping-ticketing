import type { ReactNode } from 'react'
import { TONE_TEXT_CLASSES, type Tone } from '@/theme/tones'

interface FeatureTileProps {
  icon: ReactNode
  title: ReactNode
  description: ReactNode
  tone?: Tone
}

export function FeatureTile({ icon, title, description, tone = 'success' }: FeatureTileProps) {
  return (
    <div className="rounded-xl border border-line bg-surface-low/60 p-4">
      <div className={`mb-3 text-xl ${TONE_TEXT_CLASSES[tone]}`}>{icon}</div>
      <h3 className="mb-1 text-sm font-semibold text-ink">{title}</h3>
      <p className="text-xs leading-relaxed text-muted">{description}</p>
    </div>
  )
}
