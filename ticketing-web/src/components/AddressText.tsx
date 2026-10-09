import { Tooltip, Typography } from 'antd'
import { shortenAddress } from '@/utils/formatters'

interface AddressTextProps {
  address: string
  /** Label shown next to the address when it belongs to the connected wallet. */
  isSelf?: boolean
  copyable?: boolean
  className?: string
}

export function AddressText({ address, isSelf = false, copyable = true, className = '' }: AddressTextProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono ${className}`}>
      <Tooltip title={address}>
        <Typography.Text className="font-mono! text-inherit!" copyable={copyable ? { text: address } : false}>
          {shortenAddress(address)}
        </Typography.Text>
      </Tooltip>
      {isSelf && (
        <span className="label-caps rounded-full bg-primary/15 px-2 py-0.5 text-primary-soft">You</span>
      )}
    </span>
  )
}
