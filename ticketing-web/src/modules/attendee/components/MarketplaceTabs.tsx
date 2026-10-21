import { ShopOutlined, TagOutlined } from '@ant-design/icons'
import { NavLink } from 'react-router'
import { ROUTE_PATHS } from '@/routes/routePaths'

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium no-underline transition ${
    isActive ? 'bg-primary/15! text-primary-soft!' : 'text-muted! hover:text-ink!'
  }`

export function MarketplaceTabs({ listingCount }: { listingCount?: number }) {
  return (
    <nav className="mb-8 inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface/60 p-1">
      <NavLink to={ROUTE_PATHS.marketplace} end className={tabClass}>
        <ShopOutlined /> Browse listings
        {listingCount !== undefined && (
          <span className="rounded-full bg-ink/10 px-2 font-mono text-[11px]">{listingCount}</span>
        )}
      </NavLink>
      <NavLink to={ROUTE_PATHS.listForResale()} className={tabClass}>
        <TagOutlined /> List ticket for resale
      </NavLink>
    </nav>
  )
}
