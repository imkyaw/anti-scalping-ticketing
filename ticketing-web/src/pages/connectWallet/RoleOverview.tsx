import { FeatureTile } from '@/components/FeatureTile'
import { ROLE_APPEARANCE } from '@/components/wallet/roleAppearance'
import { ROLE_DEFINITIONS, type AppRole } from '@/config/accountRoles'
import { getAccountsForRole } from '@/utils/roleAccess'
import { shortenAddress } from '@/utils/formatters'

const ROLE_ORDER: AppRole[] = ['organizer', 'attendee', 'gatekeeper']

/** No usernames: the connected wallet's address decides its role (config/accountRoles.ts). */
export function RoleOverview() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ROLE_ORDER.map((role) => (
        <FeatureTile
          key={role}
          icon={ROLE_APPEARANCE[role].icon}
          title={ROLE_DEFINITIONS[role].label}
          tone={ROLE_APPEARANCE[role].tone}
          description={
            <>
              {ROLE_DEFINITIONS[role].description}
              <span className="mt-3 block font-mono text-[11px] text-subtle">
                {getAccountsForRole(role).map((account) => (
                  <span key={account.address} className="block">
                    {account.label} · {shortenAddress(account.address)}
                  </span>
                ))}
              </span>
            </>
          }
        />
      ))}
    </div>
  )
}
