import { AddressText } from '@/components/AddressText'
import { PageHeader } from '@/components/PageHeader'
import { StatusPill } from '@/components/StatusPill'
import { useConnectedAddress } from '@/hooks/useWallet'
import { CheckInLogPanel } from '../components/CheckInLogPanel'
import { QrUploadPanel } from '../components/QrUploadPanel'
import { ValidatorAccessSummary } from '../components/ValidatorAccessSummary'
import { VerificationResultPanel } from '../components/VerificationResultPanel'
import { useCheckInVerification } from '../hooks/useCheckInVerification'
import { useValidatorEvents } from '../hooks/useValidatorEvents'

export function TicketValidatorPage() {
  const address = useConnectedAddress()
  const validatorEvents = useValidatorEvents(address)
  const { state, admitTransaction, verifyFile, admit, reject, reset } = useCheckInVerification(address)

  return (
    <>
      <PageHeader
        meta={
          <>
            <StatusPill tone="primary">Gate staff terminal</StatusPill>
            <StatusPill tone="success" dot pulse>
              Network synced
            </StatusPill>
          </>
        }
        title="Venue Entry Validator"
        description={
          <span className="flex flex-wrap items-center gap-2">
            Signing as validator <AddressText address={address} isSelf />
          </span>
        }
      />

      <ValidatorAccessSummary state={validatorEvents} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <QrUploadPanel isBusy={state.status === 'verifying' || admitTransaction.isSubmitting} onFile={verifyFile} />
        </div>
        <div className="lg:col-span-7">
          <VerificationResultPanel
            state={state}
            admitTransaction={admitTransaction}
            onAdmit={admit}
            onReject={reject}
            onReset={reset}
          />
        </div>
      </div>

      <div className="mt-8">
        <CheckInLogPanel />
      </div>
    </>
  )
}
