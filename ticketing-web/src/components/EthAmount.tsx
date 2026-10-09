import { formatEthWithSymbol } from '@/utils/formatters'
import { TONE_TEXT_CLASSES, type Tone } from '@/theme/tones'

interface EthAmountProps {
  wei: bigint
  tone?: Tone
  strikethrough?: boolean
  className?: string
}

/** Every currency value is set in monospace, per the design system. */
export function EthAmount({ wei, tone = 'neutral', strikethrough = false, className = '' }: EthAmountProps) {
  return (
    <span
      className={`font-mono font-medium ${TONE_TEXT_CLASSES[tone]} ${strikethrough ? 'line-through opacity-70' : ''} ${className}`}
    >
      {formatEthWithSymbol(wei)}
    </span>
  )
}
