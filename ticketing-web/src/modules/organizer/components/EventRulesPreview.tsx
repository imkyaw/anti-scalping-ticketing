import { GlassCard } from '@/components/GlassCard'
import { InfoRow } from '@/components/InfoRow'
import { StatusPill } from '@/components/StatusPill'
import { parseEthInput } from '@/utils/ethInput'
import { formatEthWithSymbol } from '@/utils/formatters'
import type { CreateEventFormValues } from './CreateEventForm'

/** Live summary of the immutable rules the new event will be created with. */
export function EventRulesPreview({ values }: { values: Partial<CreateEventFormValues> }) {
  const facePrice = parseEthInput(values.facePrice)
  const priceLabel = facePrice && facePrice > 0n ? formatEthWithSymbol(facePrice) : '—'

  return (
    <GlassCard
      eyebrow="Preview"
      title={values.name?.trim() || 'Untitled event'}
      extra={
        <StatusPill tone="success" dot>
          Sale opens on creation
        </StatusPill>
      }
    >
      <div className="flex flex-col gap-2">
        <InfoRow label="Face value" value={priceLabel} />
        <InfoRow label="Supply" value={values.supply ?? '—'} />
        <InfoRow label="Max per wallet" value={values.perWalletCap ?? '—'} />
        <InfoRow label="Resale ceiling" value={priceLabel} hint="100% of face value" tone="success" />
      </div>
      <p className="mt-5 text-xs leading-relaxed text-muted">
        Your wallet becomes the event organiser. Primary-sale payments go directly to you. Price, supply and caps
        cannot be changed after creation — only the sale can be opened or closed.
      </p>
    </GlassCard>
  )
}
