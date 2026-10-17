import type { ReactNode } from 'react'

interface FilterBarProps {
  children: ReactNode
  /** Right-aligned summary, e.g. "Showing 4 of 4". */
  summary?: ReactNode
}

export function FilterBar({ children, summary }: FilterBarProps) {
  return (
    <div className="glass-panel mb-6 flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>
      {summary && <div className="font-mono text-xs text-muted">{summary}</div>}
    </div>
  )
}
