import { ROLE_ACCOUNTS, type AppRole, type RoleAccount } from '@/config/accountRoles'
import { isSameAddress } from './formatters'

export function findRoleAccount(address: string | null): RoleAccount | null {
  return ROLE_ACCOUNTS.find((account) => isSameAddress(account.address, address)) ?? null
}

export function getAccountsForRole(role: AppRole): RoleAccount[] {
  return ROLE_ACCOUNTS.filter((account) => account.role === role)
}
