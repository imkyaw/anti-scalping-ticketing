/** Semantic colour tones shared by pills, cards, stat tiles and modals. */
export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export const TONE_PILL_CLASSES: Record<Tone, string> = {
  neutral: 'border-line-strong bg-ink/5 text-muted',
  primary: 'border-primary/40 bg-primary/15 text-primary-soft',
  success: 'border-success/30 bg-success/10 text-success-soft',
  warning: 'border-warning/30 bg-warning/10 text-warning-soft',
  danger: 'border-danger/30 bg-danger/10 text-danger-soft',
}

export const TONE_TEXT_CLASSES: Record<Tone, string> = {
  neutral: 'text-ink',
  primary: 'text-primary-soft',
  success: 'text-success-soft',
  warning: 'text-warning-soft',
  danger: 'text-danger-soft',
}

export const TONE_DOT_CLASSES: Record<Tone, string> = {
  neutral: 'bg-subtle',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

/** Level-3 state halo from the design system (valid / warning / revoked). */
export const TONE_CARD_CLASSES: Record<Tone, string> = {
  neutral: '',
  primary: 'border-primary/40!',
  success: 'border-success/40! shadow-[0_0_24px_-2px_rgba(16,185,129,0.3)]!',
  warning: 'border-warning/40!',
  danger: 'border-danger/40! shadow-[0_0_24px_-2px_rgba(239,68,68,0.3)]!',
}

export const TONE_SOFT_PANEL_CLASSES: Record<Tone, string> = {
  neutral: 'border-line bg-surface-low/60',
  primary: 'border-primary/30 bg-primary/10',
  success: 'border-success/30 bg-success/10',
  warning: 'border-warning/30 bg-warning/10',
  danger: 'border-danger/30 bg-danger/10',
}
