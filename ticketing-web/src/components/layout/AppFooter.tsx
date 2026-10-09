import { SafetyCertificateOutlined } from '@ant-design/icons'
import { hasEventTicketingDeployment, getEventTicketingAddress } from '@/blockchain/contracts'
import { TARGET_NETWORK } from '@/blockchain/networks'
import { AddressText } from '@/components/AddressText'
import { StatusPill } from '@/components/StatusPill'
import { PageContainer } from './PageContainer'

export function AppFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface-low/60 py-8">
      <PageContainer className="flex flex-col gap-6">
        <div className="glass-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone="success" icon={<SafetyCertificateOutlined />}>
              EventTicketing contract
            </StatusPill>
            <span className="font-mono text-xs text-muted">Resale cap: ≤ 100% of face value</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
            <span>
              {TARGET_NETWORK.name} · Chain {TARGET_NETWORK.chainId}
            </span>
            {hasEventTicketingDeployment() && <AddressText address={getEventTicketingAddress()} />}
          </div>
        </div>
        <p className="text-xs text-subtle">
          FairTicket — anti-scalping event ticketing proof of concept. Tickets are ERC-721 tokens; every
          rule is enforced by the smart contract, not this interface.
        </p>
      </PageContainer>
    </footer>
  )
}
