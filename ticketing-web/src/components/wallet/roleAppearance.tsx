import { QrcodeOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'
import type { AppRole } from '@/config/accountRoles'
import type { Tone } from '@/theme/tones'

export const ROLE_APPEARANCE: Record<AppRole, { icon: ReactNode; tone: Tone }> = {
  organizer: { icon: <TeamOutlined />, tone: 'warning' },
  attendee: { icon: <ShopOutlined />, tone: 'primary' },
  gatekeeper: { icon: <QrcodeOutlined />, tone: 'success' },
}
