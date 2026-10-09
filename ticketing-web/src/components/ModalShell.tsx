import { Modal } from 'antd'
import type { ReactNode } from 'react'
import { TONE_TEXT_CLASSES, type Tone } from '@/theme/tones'

interface ModalShellProps {
  open: boolean
  title: ReactNode
  eyebrow?: ReactNode
  icon?: ReactNode
  tone?: Tone
  onClose: () => void
  footer?: ReactNode
  /** Prevent closing while a transaction is in flight. */
  isLocked?: boolean
  width?: number
  children: ReactNode
}

/** Consistent modal frame with a tone-coloured header, used for confirmations and pop-ups. */
export function ModalShell({
  open,
  title,
  eyebrow,
  icon,
  tone = 'primary',
  onClose,
  footer,
  isLocked = false,
  width = 520,
  children,
}: ModalShellProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={width}
      centered
      destroyOnHidden
      closable={!isLocked}
      mask={{ closable: !isLocked }}
      keyboard={!isLocked}
      title={
        <div className="flex items-center gap-3 pr-6">
          {icon && <span className={`text-2xl ${TONE_TEXT_CLASSES[tone]}`}>{icon}</span>}
          <div>
            {eyebrow && <p className="label-caps mb-1 text-muted">{eyebrow}</p>}
            <p className={`font-display text-lg font-semibold ${TONE_TEXT_CLASSES[tone]}`}>{title}</p>
          </div>
        </div>
      }
    >
      <div className="pt-2">{children}</div>
      {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
    </Modal>
  )
}
