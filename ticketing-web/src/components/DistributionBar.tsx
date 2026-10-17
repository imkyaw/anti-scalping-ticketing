import { TONE_DOT_CLASSES, type Tone } from '@/theme/tones'

export interface DistributionSegment {
  label: string
  value: bigint
  tone: Tone
}

interface DistributionBarProps {
  segments: DistributionSegment[]
  total: bigint
}

/** Stacked bar for supply / sold / checked-in style breakdowns. */
export function DistributionBar({ segments, total }: DistributionBarProps) {
  const toWidth = (value: bigint) => (total === 0n ? 0 : Number((value * 10_000n) / total) / 100)

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-line">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={`${TONE_DOT_CLASSES[segment.tone]} transition-all`}
            style={{ width: `${toWidth(segment.value)}%` }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((segment) => (
          <span key={segment.label} className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className={`size-2 rounded-full ${TONE_DOT_CLASSES[segment.tone]}`} />
            <span className="text-ink">{segment.value.toString()}</span> {segment.label}
          </span>
        ))}
      </div>
    </div>
  )
}
