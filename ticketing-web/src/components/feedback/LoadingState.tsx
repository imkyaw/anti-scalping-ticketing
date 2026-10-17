import { Spin } from 'antd'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ message = 'Reading from the blockchain…', fullScreen = false }: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-center ${fullScreen ? 'min-h-screen' : 'py-20'}`}
    >
      <Spin size="large" />
      <p className="font-mono text-xs text-muted">{message}</p>
    </div>
  )
}
