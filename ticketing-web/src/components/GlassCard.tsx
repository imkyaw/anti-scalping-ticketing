import type { ReactNode } from 'react'
import { TONE_CARD_CLASSES, type Tone } from '@/theme/tones'

interface GlassCardProps {
  title?: ReactNode
  eyebrow?: ReactNode
  extra?: ReactNode
  tone?: Tone
  className?: string
  bodyClassName?: string
  children: ReactNode
}

/** Level-2 glass surface used for every content section. */
export function GlassCard({
  title,
  eyebrow,
  extra,
  tone = 'neutral',
  className = '',
  bodyClassName = '',
  children,
}: GlassCardProps) {
  const hasHeader = Boolean(title || eyebrow || extra)

  return (
    <section className={`glass-card flex flex-col p-5 sm:p-6 ${TONE_CARD_CLASSES[tone]} ${className}`}>
      {hasHeader && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p className="label-caps mb-2 text-muted">{eyebrow}</p>}
            {title && <h2 className="text-lg font-semibold text-ink sm:text-xl">{title}</h2>}
          </div>
          {extra && <div className="shrink-0">{extra}</div>}
        </header>
      )}
      <div className={`flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
