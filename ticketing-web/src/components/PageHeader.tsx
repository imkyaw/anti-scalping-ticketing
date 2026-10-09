import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Pills / metadata rendered above the title. */
  meta?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, meta, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 max-w-3xl">
        {meta && <div className="mb-3 flex flex-wrap items-center gap-2">{meta}</div>}
        {eyebrow && <p className="label-caps mb-2 text-success-soft">{eyebrow}</p>}
        <h1 className="text-3xl font-bold text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-tight">{title}</h1>
        {description && <p className="mt-3 text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  )
}
