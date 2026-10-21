import type { ReactNode } from 'react'
import { formatTokenId } from '@/utils/formatters'

interface ResultHeaderProps {
  tone: 'success' | 'danger'
  icon: ReactNode
  title: ReactNode
  subtitle: ReactNode
  tokenId: string
}

export function ResultHeader({ tone, icon, title, subtitle, tokenId }: ResultHeaderProps) {
  const background = tone === 'success' ? 'bg-success/90' : 'bg-danger/85'
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 ${background}`}>
      <div className="flex items-center gap-3 text-white">
        <span className="text-3xl">{icon}</span>
        <div>
          <p className="font-display text-xl font-bold uppercase sm:text-2xl">{title}</p>
          <p className="label-caps mt-1 text-white/80">{subtitle}</p>
        </div>
      </div>
      <span className="rounded-lg bg-black/25 px-3 py-1.5 font-mono text-sm font-bold text-white">
        TICKET {formatTokenId(tokenId)}
      </span>
    </div>
  )
}
