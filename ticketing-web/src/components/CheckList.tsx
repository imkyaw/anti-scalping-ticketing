import { CheckCircleFilled, CloseCircleFilled, MinusCircleOutlined } from '@ant-design/icons'
import type { ReactNode } from 'react'

export interface CheckListItem {
  key: string
  label: ReactNode
  /** null = not evaluated yet. */
  passed: boolean | null
  detail?: ReactNode
}

interface CheckListProps {
  items: CheckListItem[]
}

/** Pass / fail checklist used for contract checks and gate verification. */
export function CheckList({ items }: CheckListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.key} className="flex items-start gap-3">
          <span className="mt-0.5 text-base">
            {item.passed === null ? (
              <MinusCircleOutlined className="text-subtle" />
            ) : item.passed ? (
              <CheckCircleFilled className="text-success" />
            ) : (
              <CloseCircleFilled className="text-danger" />
            )}
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-medium ${item.passed === false ? 'text-danger-soft' : 'text-ink'}`}>
              {item.label}
            </p>
            {item.detail && <p className="mt-0.5 font-mono text-xs text-muted">{item.detail}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}
