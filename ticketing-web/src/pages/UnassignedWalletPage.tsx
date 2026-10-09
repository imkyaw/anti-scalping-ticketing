import { DisconnectOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { AddressText } from '@/components/AddressText'
import { GlassCard } from '@/components/GlassCard'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { PageContainer } from '@/components/layout/PageContainer'
import { ROLE_APPEARANCE } from '@/components/wallet/roleAppearance'
import { StatusPill } from '@/components/StatusPill'
import { ROLE_ACCOUNTS, ROLE_DEFINITIONS } from '@/config/accountRoles'
import { useWallet } from '@/hooks/useWallet'

export function UnassignedWalletPage() {
  const { address, disconnect } = useWallet()

  return (
    <div className="flex min-h-screen flex-col py-6 lg:py-10">
      <PageContainer className="flex flex-1 flex-col">
        <BrandLogo />
        <div className="mx-auto flex w-full max-w-2xl flex-1 items-center py-10">
          <GlassCard eyebrow="Access" title="This wallet has no role" tone="warning" className="w-full">
            <p className="text-sm text-muted">
              {address && <AddressText address={address} className="text-ink" />} is not listed in the role
              configuration. Switch MetaMask to one of these accounts — the app updates automatically.
            </p>

            <ul className="mt-5 flex flex-col gap-2">
              {ROLE_ACCOUNTS.map((account) => (
                <li
                  key={account.address}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface-low/60 px-4 py-3"
                >
                  <span className="flex items-center gap-3 text-sm text-ink">
                    <UserSwitchOutlined className="text-muted" />
                    {account.label}
                    <AddressText address={account.address} className="text-muted" />
                  </span>
                  <StatusPill tone={ROLE_APPEARANCE[account.role].tone}>{ROLE_DEFINITIONS[account.role].label}</StatusPill>
                </li>
              ))}
            </ul>

            <Button className="mt-6" icon={<DisconnectOutlined />} onClick={disconnect}>
              Disconnect
            </Button>
          </GlassCard>
        </div>
      </PageContainer>
    </div>
  )
}
