import { Breadcrumb } from 'antd'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

export interface BreadcrumbCrumb {
  label: ReactNode
  to?: string
}

/** Breadcrumb trail above a page header; wrapped so spacing isn't reset by antd. */
export function PageBreadcrumb({ items }: { items: BreadcrumbCrumb[] }) {
  return (
    <div className="mb-6">
      <Breadcrumb items={items.map((item) => ({ title: item.to ? <Link to={item.to}>{item.label}</Link> : item.label }))} />
    </div>
  )
}
