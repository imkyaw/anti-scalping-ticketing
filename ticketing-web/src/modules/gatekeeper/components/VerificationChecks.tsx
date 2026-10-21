import { CheckList } from '@/components/CheckList'
import type { CheckInCheck } from '@/services/checkInService'

export function VerificationChecks({ checks }: { checks: CheckInCheck[] }) {
  return (
    <div className="rounded-xl border border-line bg-surface-low/60 p-4">
      <p className="label-caps mb-3 text-muted">Verification trace</p>
      <CheckList
        items={checks.map((check) => ({
          key: check.id,
          label: check.label,
          passed: check.passed,
          detail: check.detail,
        }))}
      />
    </div>
  )
}
