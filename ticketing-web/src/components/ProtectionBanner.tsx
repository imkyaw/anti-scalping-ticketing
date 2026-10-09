import { SafetyCertificateOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

interface ProtectionBannerProps {
  title: ReactNode
  description: ReactNode
  extra?: ReactNode
}

/** Highlighted strip that explains an on-chain rule to the user. */
export function ProtectionBanner({ title, description, extra }: ProtectionBannerProps) {
  return (
    <div className="glass-panel flex flex-col gap-4 border-l-4 border-l-success! p-5 sm:flex-row sm:items-center">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/15 text-xl text-success-soft">
        <SafetyCertificateOutlined />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {extra && <div className="shrink-0">{extra}</div>}
    </div>
  )
}
