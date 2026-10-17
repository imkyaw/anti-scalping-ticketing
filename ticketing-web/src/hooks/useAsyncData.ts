import { useCallback, useEffect, useState } from 'react'
import { getBlockchainErrorMessage } from '@/utils/blockchainErrors'

export interface AsyncDataState<T> {
  data: T | undefined
  error: string | null
  isLoading: boolean
  /** True while re-fetching data that is already on screen. */
  isRefreshing: boolean
  reload: () => void
}

interface LoadResult<T> {
  loader: () => Promise<T>
  token: number
  data: T | undefined
  error: string | null
}

/**
 * Run a memoised async loader (wrap it in useCallback) and expose loading / error state.
 * Changing the loader identity triggers a fresh load; `reload()` re-runs it after transactions.
 */
export function useAsyncData<T>(loader: () => Promise<T>): AsyncDataState<T> {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState<LoadResult<T> | null>(null)

  useEffect(() => {
    let isCancelled = false
    loader().then(
      (data) => {
        if (!isCancelled) setResult({ loader, token: reloadToken, data, error: null })
      },
      (error: unknown) => {
        console.error(error)
        if (!isCancelled) {
          setResult({ loader, token: reloadToken, data: undefined, error: getBlockchainErrorMessage(error) })
        }
      },
    )
    return () => {
      isCancelled = true
    }
  }, [loader, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  const isSameLoader = result?.loader === loader
  const isCurrent = isSameLoader && result.token === reloadToken
  const data = isSameLoader ? result.data : undefined

  return {
    data,
    error: isCurrent ? result.error : null,
    isLoading: !isCurrent && data === undefined,
    isRefreshing: !isCurrent && data !== undefined,
    reload,
  }
}
