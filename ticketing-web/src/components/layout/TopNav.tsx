import { MenuOutlined } from '@ant-design/icons'
import { Button, Drawer } from 'antd'
import { useState } from 'react'
import { NavLink } from 'react-router'
import { RoleBadge } from '@/components/wallet/RoleBadge'
import { WalletButton } from '@/components/wallet/WalletButton'
import { useAccountRole } from '@/hooks/useAccountRole'
import { BrandLogo } from './BrandLogo'
import { PageContainer } from './PageContainer'
import { ThemeToggle } from './ThemeToggle'

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition no-underline ${
    isActive
      ? 'bg-primary! text-white! shadow-[0_0_16px_rgba(99,102,241,0.45)]'
      : 'text-muted! hover:bg-ink/5! hover:text-ink!'
  }`

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-3 text-base font-semibold no-underline ${
    isActive ? 'bg-primary! text-white!' : 'text-muted!'
  }`

export function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigationItems = useAccountRole()?.navigationItems ?? []

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
      <PageContainer className="flex h-16 items-center justify-between gap-4 lg:h-20">
        <div className="flex items-center gap-6">
          <BrandLogo />
          <nav className="hidden items-center gap-1 rounded-xl border border-line bg-surface/60 p-1 lg:flex">
            {navigationItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <RoleBadge compact />
          <WalletButton />
        </div>

        <Button
          className="lg:hidden!"
          icon={<MenuOutlined />}
          aria-label="Open navigation"
          onClick={() => setIsMenuOpen(true)}
        />
      </PageContainer>

      <Drawer
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        placement="right"
        size={300}
        title={<BrandLogo />}
      >
        <div className="mb-6 flex flex-col items-start gap-3 md:hidden">
          <RoleBadge />
          <WalletButton />
          <ThemeToggle />
        </div>
        <nav className="flex flex-col gap-1">
          {navigationItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={mobileLinkClass} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </Drawer>
    </header>
  )
}
