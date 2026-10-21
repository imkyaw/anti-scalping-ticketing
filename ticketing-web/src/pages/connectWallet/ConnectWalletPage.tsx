import { ApiOutlined, SwapOutlined, WalletOutlined } from '@ant-design/icons'
import { Alert, Button } from 'antd'
import { Navigate, useLocation } from 'react-router'
import { hasEventTicketingDeployment } from '@/blockchain/contracts'
import { TARGET_NETWORK } from '@/blockchain/networks'
import { GlassCard } from '@/components/GlassCard'
import { StatusPill } from '@/components/StatusPill'
import { LoadingState } from '@/components/feedback/LoadingState'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { PageContainer } from '@/components/layout/PageContainer'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useWallet } from '@/hooks/useWallet'
import type { ConnectRedirectState } from '@/routes/RequireWallet'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { shortenAddress } from '@/utils/formatters'
import { ConnectStep } from './ConnectStep'
import { RoleOverview } from './RoleOverview'

const METAMASK_DOWNLOAD_URL = 'https://metamask.io/download/'

export function ConnectWalletPage() {
  const location = useLocation()
  const wallet = useWallet()

  if (wallet.isRestoring) return <LoadingState fullScreen message="Checking wallet connection…" />

  if (wallet.isConnected && wallet.isTargetNetwork) {
    const from = (location.state as ConnectRedirectState | null)?.from
    return <Navigate to={from && from !== ROUTE_PATHS.connect ? from : '/'} replace />
  }

  const activeStep = !wallet.isWalletAvailable ? 1 : !wallet.isConnected ? 2 : 3

  return (
    <div className="flex min-h-screen flex-col py-6 lg:py-10">
      <PageContainer className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4">
          <BrandLogo />
          <ThemeToggle />
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-12 lg:gap-12">
          <section className="lg:col-span-7">
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusPill tone="success" dot pulse>
                {TARGET_NETWORK.name}
              </StatusPill>
              <StatusPill tone="primary">Anti-scalping protocol</StatusPill>
            </div>
            <h1 className="text-4xl font-bold text-ink sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
              Your wallet is your ticket.
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted">
              FairTicket issues event tickets as ERC-721 tokens. The smart contract caps every resale at
              face value and records each check-in on-chain. There are no accounts or passwords — connect
              MetaMask to continue.
            </p>
            <div className="mt-8">
              <RoleOverview />
            </div>
          </section>

          <section className="lg:col-span-5">
            <GlassCard eyebrow="Secure access" title="Connect your wallet" tone="primary">
              <ol className="flex flex-col gap-3">
                <ConnectStep
                  index={1}
                  title="MetaMask detected"
                  description={
                    wallet.isWalletAvailable
                      ? 'Browser wallet found.'
                      : 'MetaMask is required to connect your wallet.'
                  }
                  isComplete={wallet.isWalletAvailable}
                  isActive={activeStep === 1}
                  action={
                    <Button href={METAMASK_DOWNLOAD_URL} target="_blank" icon={<ApiOutlined />}>
                      Install MetaMask
                    </Button>
                  }
                />
                <ConnectStep
                  index={2}
                  title="Connect an account"
                  description={
                    wallet.address
                      ? `Connected as ${shortenAddress(wallet.address)}`
                      : 'Approve the connection request in MetaMask.'
                  }
                  isComplete={wallet.isConnected}
                  isActive={activeStep === 2}
                  action={
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<WalletOutlined />}
                      loading={wallet.isConnecting}
                      onClick={wallet.connect}
                    >
                      {wallet.isConnecting ? 'Waiting for MetaMask…' : 'Connect MetaMask'}
                    </Button>
                  }
                />
                <ConnectStep
                  index={3}
                  title={`Switch to ${TARGET_NETWORK.name}`}
                  description={`Chain ID ${TARGET_NETWORK.chainId} · RPC ${TARGET_NETWORK.rpcUrl}`}
                  isComplete={wallet.isConnected && wallet.isTargetNetwork}
                  isActive={activeStep === 3}
                  action={
                    <Button
                      type="primary"
                      block
                      icon={<SwapOutlined />}
                      loading={wallet.isSwitchingNetwork}
                      onClick={wallet.switchToTargetNetwork}
                    >
                      Switch to {TARGET_NETWORK.name}
                    </Button>
                  }
                />
              </ol>

              {wallet.error && (
                <Alert className="mt-4!" type="error" showIcon title={wallet.error} closable={{ onClose: wallet.clearError }} />
              )}
              {!hasEventTicketingDeployment() && (
                <Alert
                  className="mt-4!"
                  type="warning"
                  showIcon
                  title="Contract not deployed"
                  description="Run `npx hardhat run scripts/deploy.js --network localhost` from the project root."
                />
              )}

              <p className="mt-5 text-xs leading-relaxed text-subtle">
                Using Hardhat test accounts? Import a private key printed by <code>npx hardhat node</code> into
                MetaMask. Test ETH has no real value.
              </p>
            </GlassCard>
          </section>
        </div>
      </PageContainer>
    </div>
  )
}
