import { CloudUploadOutlined } from '@ant-design/icons'
import { Upload } from 'antd'
import { GlassCard } from '@/components/GlassCard'
import { StatusPill } from '@/components/StatusPill'

interface QrUploadPanelProps {
  isBusy: boolean
  onFile: (file: File) => void
}

const VERIFICATION_STEPS = [
  'Decode the check-in QR image',
  'Recover the signer and check expiry (off-chain)',
  'Read owner, event and used status from the contract',
  'Admit: send markUsed(ticket) from your validator wallet',
]

/** Laptop-friendly replacement for a camera scanner: staff upload the attendee's QR image. */
export function QrUploadPanel({ isBusy, onFile }: QrUploadPanelProps) {
  return (
    <GlassCard
      title="Upload check-in QR"
      eyebrow="Optical input · image file"
      extra={<StatusPill tone="neutral">PNG / JPG</StatusPill>}
    >
      <Upload.Dragger
        accept="image/*"
        multiple={false}
        showUploadList={false}
        disabled={isBusy}
        beforeUpload={(file) => {
          onFile(file)
          return Upload.LIST_IGNORE
        }}
        className="block"
      >
        <div className="flex flex-col items-center gap-3 px-4 py-8">
          <div className="flex size-16 items-center justify-center rounded-2xl border border-success/40 bg-success/10 text-3xl text-success-soft">
            <CloudUploadOutlined />
          </div>
          <p className="text-base font-semibold text-ink">Drop the attendee&apos;s QR image here</p>
          <p className="max-w-xs text-xs text-muted">
            or click to choose a file. Attendees download it from My Tickets → Ticket → Generate check-in QR.
          </p>
        </div>
      </Upload.Dragger>

      <ol className="mt-6 flex flex-col gap-2">
        {VERIFICATION_STEPS.map((step, index) => (
          <li key={step} className="flex items-center gap-3 font-mono text-xs text-muted">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-line text-[10px] text-primary-soft">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </GlassCard>
  )
}
