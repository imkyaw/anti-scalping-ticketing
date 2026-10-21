import { SafetyCertificateOutlined, UserAddOutlined } from '@ant-design/icons'
import { App, Button, Form, Select } from 'antd'
import { AddressText } from '@/components/AddressText'
import { GlassCard } from '@/components/GlassCard'
import { StatusPill } from '@/components/StatusPill'
import { TransactionStatus } from '@/components/TransactionStatus'
import { useTransaction } from '@/hooks/useTransaction'
import { grantValidator } from '@/services/validationService'
import type { ValidatorGrant } from '@/types/ticketing'
import { isSameAddress, shortenAddress } from '@/utils/formatters'
import { findRoleAccount, getAccountsForRole } from '@/utils/roleAccess'

interface ValidatorAccessPanelProps {
  eventId: bigint
  validators: ValidatorGrant[]
  canManage: boolean
  onGranted: () => void
}

interface GrantFormValues {
  validator: string
}

export function ValidatorAccessPanel({ eventId, validators, canManage, onGranted }: ValidatorAccessPanelProps) {
  const { message } = App.useApp()
  const [form] = Form.useForm<GrantFormValues>()
  const transaction = useTransaction()

  // Gate staff come from config/accountRoles.ts; granting is still an on-chain transaction.
  const gatekeeperAccounts = getAccountsForRole('gatekeeper')
  const isGranted = (address: string) => validators.some((grant) => isSameAddress(grant.validator, address))
  const pendingAccounts = gatekeeperAccounts.filter((account) => !isGranted(account.address))

  const handleGrant = async ({ validator }: GrantFormValues) => {
    const result = await transaction.execute(() => grantValidator(eventId, validator))
    if (result.ok) {
      message.success('Validator role granted')
      form.resetFields()
      onGranted()
    }
  }

  return (
    <GlassCard
      eyebrow="Gate access control"
      title="Validators"
      extra={<StatusPill tone="primary">{validators.length} granted</StatusPill>}
    >
      <p className="mb-5 text-sm text-muted">
        Validators are gate-staff wallets allowed to mark this event&apos;s tickets as used. The role is scoped to
        this event only and cannot be revoked in the current contract.
      </p>

      {canManage && gatekeeperAccounts.length === 0 && (
        <p className="rounded-lg border border-dashed border-line px-4 py-4 text-sm text-muted">
          No accounts have the gatekeeper role in <code>config/accountRoles.ts</code>.
        </p>
      )}

      {canManage && gatekeeperAccounts.length > 0 && (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGrant}
          requiredMark={false}
          disabled={transaction.isSubmitting || pendingAccounts.length === 0}
        >
          <Form.Item
            name="validator"
            label="Gatekeeper account"
            extra={pendingAccounts.length === 0 ? 'All gatekeeper accounts already have access to this event.' : undefined}
            rules={[{ required: true, message: 'Choose a gatekeeper account' }]}
          >
            <Select
              size="large"
              placeholder="Select a gatekeeper"
              options={gatekeeperAccounts.map((account) => ({
                value: account.address,
                disabled: isGranted(account.address),
                label: (
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      {account.label} <span className="font-mono text-muted">· {shortenAddress(account.address)}</span>
                    </span>
                    {isGranted(account.address) && <span className="text-xs text-success-soft">Granted</span>}
                  </span>
                ),
              }))}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<UserAddOutlined />} loading={transaction.isSubmitting} block>
            Grant validator role
          </Button>
        </Form>
      )}

      <TransactionStatus {...transaction} className="mt-4" />

      <ul className="mt-6 flex flex-col gap-2">
        {validators.length === 0 && (
          <li className="rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
            No validators yet. Gatekeepers cannot admit anyone until you grant access.
          </li>
        )}
        {validators.map((grant) => (
          <li
            key={grant.validator}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-low/60 px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm text-ink">
              <SafetyCertificateOutlined className="text-success-soft" />
              {findRoleAccount(grant.validator)?.label}
              <AddressText address={grant.validator} className="text-muted" />
            </span>
            <span className="font-mono text-[11px] text-subtle">Block #{grant.blockNumber}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}
