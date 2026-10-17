import { useMemo } from 'react'
import { ROLE_DEFINITIONS, type AppArea } from '@/config/accountRoles'
import { useAppSelector } from '@/redux/hooks'
import { AREA_NAVIGATION } from '@/routes/navigationItems'
import { findRoleAccount } from '@/utils/roleAccess'

/** Role of the connected wallet according to config/accountRoles.ts, or null if unassigned. */
export function useAccountRole() {
  const address = useAppSelector((state) => state.wallet.address)

  return useMemo(() => {
    const account = findRoleAccount(address)
    if (!account) return null

    const definition = ROLE_DEFINITIONS[account.role]
    return {
      account,
      role: account.role,
      definition,
      navigationItems: definition.areas.map((area) => AREA_NAVIGATION[area]),
      homePath: AREA_NAVIGATION[definition.areas[0]].to,
      canAccess: (area: AppArea) => definition.areas.includes(area),
    }
  }, [address])
}
