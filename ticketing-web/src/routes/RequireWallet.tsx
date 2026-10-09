import { Navigate, Outlet, useLocation } from 'react-router'
import { LoadingState } from '@/components/feedback/LoadingState'
import { useWallet } from '@/hooks/useWallet'
import { ROUTE_PATHS } from './routePaths'

export interface ConnectRedirectState {
  from?: string
}

/** Wallet = login. Every app route needs a connected wallet on the target network. */
export function RequireWallet() {
  const { isRestoring, isConnected, isTargetNetwork } = useWallet()
  const location = useLocation()

  if (isRestoring) return <LoadingState fullScreen message="Checking wallet connection…" />

  if (!isConnected || !isTargetNetwork) {
    const state: ConnectRedirectState = { from: `${location.pathname}${location.search}` }
    return <Navigate to={ROUTE_PATHS.connect} replace state={state} />
  }

  return <Outlet />
}
