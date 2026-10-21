import { Outlet } from 'react-router'
import { useAccountRole } from '@/hooks/useAccountRole'
import { UnassignedWalletPage } from '@/pages/UnassignedWalletPage'

/** Wallets not listed in config/accountRoles.ts get no app sections. */
export function RequireAssignedRole() {
  return useAccountRole() ? <Outlet /> : <UnassignedWalletPage />
}
