import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button } from 'antd'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title = 'Could not load data', message, onRetry }: ErrorStateProps) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-3 border-danger/30! px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-danger/10 text-2xl text-danger-soft">
        <ExclamationCircleOutlined />
      </div>
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="max-w-md text-sm text-muted">{message}</p>
      {onRetry && (
        <Button icon={<ReloadOutlined />} onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </div>
  )
}
