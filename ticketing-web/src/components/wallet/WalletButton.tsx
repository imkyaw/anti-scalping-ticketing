import { CopyOutlined, DisconnectOutlined, DownOutlined, WalletOutlined } from '@ant-design/icons'
import { App, Button, Dropdown, type MenuProps } from 'antd'
import { useWallet } from '@/hooks/useWallet'
import { formatEthWithSymbol, shortenAddress } from '@/utils/formatters'

export function WalletButton() {
  const { message } = App.useApp()
  const { address, balanceWei, isConnecting, connect, disconnect } = useWallet()

  if (!address) {
    return (
      <Button type="primary" icon={<WalletOutlined />} loading={isConnecting} onClick={connect}>
        Connect Wallet
      </Button>
    )
  }

  const items: MenuProps['items'] = [
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: 'Copy address',
      onClick: async () => {
        await navigator.clipboard.writeText(address)
        message.success('Address copied')
      },
    },
    { type: 'divider' },
    { key: 'disconnect', icon: <DisconnectOutlined />, label: 'Disconnect', danger: true, onClick: disconnect },
  ]

  return (
    <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
      <button
        type="button"
        className="flex items-center gap-3 rounded-xl border border-line bg-surface/80 py-1.5 pr-3 pl-1.5 text-left transition hover:border-line-strong"
      >
        <span className="whitespace-nowrap rounded-lg bg-surface-high px-2.5 py-1.5 font-mono text-xs text-warning-soft">
          {balanceWei === null ? '—' : formatEthWithSymbol(balanceWei, 3)}
        </span>
        <span className="font-mono text-xs text-ink">{shortenAddress(address)}</span>
        <DownOutlined className="text-[10px] text-muted" />
      </button>
    </Dropdown>
  )
}
