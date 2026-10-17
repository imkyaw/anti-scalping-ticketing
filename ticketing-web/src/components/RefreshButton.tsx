import { SyncOutlined } from '@ant-design/icons'
import { Button } from 'antd'

interface RefreshButtonProps {
  onRefresh: () => void
  isRefreshing: boolean
}

export function RefreshButton({ onRefresh, isRefreshing }: RefreshButtonProps) {
  return (
    <Button icon={<SyncOutlined spin={isRefreshing} />} onClick={onRefresh} disabled={isRefreshing}>
      Refresh
    </Button>
  )
}
