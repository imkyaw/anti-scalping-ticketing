import type { ReactNode } from 'react'
import type { AsyncDataState } from '@/hooks/useAsyncData'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'

interface AsyncContentProps<T> {
  state: AsyncDataState<T>
  loadingMessage?: string
  errorTitle?: string
  children: (data: T) => ReactNode
}

/** Render loading / error states for an async loader, then the data. */
export function AsyncContent<T>({ state, loadingMessage, errorTitle, children }: AsyncContentProps<T>) {
  if (state.error && state.data === undefined) {
    return <ErrorState title={errorTitle} message={state.error} onRetry={state.reload} />
  }
  if (state.data === undefined) return <LoadingState message={loadingMessage} />
  return <>{children(state.data)}</>
}
