import { GlassCard } from '@/components/GlassCard'
import { StatusPill } from '@/components/StatusPill'
import { useAppSelector } from '@/redux/hooks'
import { formatTime, formatTokenId, shortenAddress } from '@/utils/formatters'

/** Session log of this gate's decisions (kept in memory, not on-chain). */
export function CheckInLogPanel() {
  const log = useAppSelector((state) => state.gatekeeperCheckIn.log)

  return (
    <GlassCard eyebrow="Recent gate activity" title="Check-in log" extra={<span className="font-mono text-xs text-muted">This session</span>}>
      {log.length === 0 ? (
        <p className="text-sm text-muted">No tickets checked yet.</p>
      ) : (
        <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {log.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-1.5 rounded-lg border border-line bg-surface-low/60 px-4 py-3 font-mono text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted">{formatTime(entry.recordedAt)}</span>
                <StatusPill tone={entry.outcome === 'admitted' ? 'success' : 'danger'}>
                  {entry.outcome === 'admitted' ? 'Admitted' : 'Rejected'}
                </StatusPill>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-ink">
                  {formatTokenId(entry.tokenId)} {entry.eventName && <span className="text-muted">· {entry.eventName}</span>}
                </span>
                <span className="text-subtle">{shortenAddress(entry.holder)}</span>
              </div>
              {entry.reason && <span className="truncate text-danger-soft">{entry.reason}</span>}
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
