import type { ReactNode } from 'react'
import { TONE_DOT_CLASSES, TONE_PILL_CLASSES, type Tone } from '@/theme/tones'

interface StatusPillProps {
  tone?: Tone
  /** Show a leading status dot; `pulse` animates it for live states. */
  dot?: boolean
  pulse?: boolean
  icon?: ReactNode
  className?: string
  children: ReactNode
}

export function StatusPill({
  tone = 'neutral',
  dot = false,
  pulse = false,
  icon,
  className = '',
  children,
}: StatusPillProps) {
  return (
    <span
      className={`label-caps inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 whitespace-nowrap ${TONE_PILL_CLASSES[tone]} ${className}`}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && (
            <span className={`absolute inline-flex size-full animate-ping rounded-full opacity-75 ${TONE_DOT_CLASSES[tone]}`} />
          )}
          <span className={`relative inline-flex size-1.5 rounded-full ${TONE_DOT_CLASSES[tone]}`} />
        </span>
      )}
      {icon}
      {children}
    </span>
  )
}
