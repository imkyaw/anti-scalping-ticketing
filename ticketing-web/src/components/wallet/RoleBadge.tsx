import { StatusPill } from '@/components/StatusPill'
import { useAccountRole } from '@/hooks/useAccountRole'
import { ROLE_APPEARANCE } from './roleAppearance'

interface RoleBadgeProps {
  /** Hide the role name below the xl breakpoint so the header fits; the icon and colour still show the role. */
  compact?: boolean
}

export function RoleBadge({ compact = false }: RoleBadgeProps) {
  const access = useAccountRole()
  if (!access) return null

  const { icon, tone } = ROLE_APPEARANCE[access.role]
  return (
    <StatusPill tone={tone} icon={icon}>
      <span className={compact ? 'hidden xl:inline' : undefined}>{access.definition.label} · </span>
      {access.account.label}
    </StatusPill>
  )
}
