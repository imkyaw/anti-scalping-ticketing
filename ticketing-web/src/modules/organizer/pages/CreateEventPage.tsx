import { App } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { GlassCard } from '@/components/GlassCard'
import { PageBreadcrumb } from '@/components/PageBreadcrumb'
import { PageHeader } from '@/components/PageHeader'
import { TransactionStatus } from '@/components/TransactionStatus'
import { useTransaction } from '@/hooks/useTransaction'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { createEvent, getCreatedEventId } from '@/services/eventService'
import type { CreateEventInput } from '@/types/ticketing'
import { CreateEventForm, type CreateEventFormValues } from '../components/CreateEventForm'
import { EventRulesPreview } from '../components/EventRulesPreview'

export function CreateEventPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const transaction = useTransaction()
  const [previewValues, setPreviewValues] = useState<Partial<CreateEventFormValues>>({
    supply: 100,
    perWalletCap: 2,
  })

  const handleSubmit = async (input: CreateEventInput) => {
    const result = await transaction.execute(() => createEvent(input))
    if (!result.ok) return
    message.success(`"${input.name}" created`)
    const eventId = await getCreatedEventId(result.receipt)
    navigate(eventId ? ROUTE_PATHS.manageEvent(eventId) : ROUTE_PATHS.organizerDashboard)
  }

  return (
    <>
      <PageBreadcrumb items={[{ label: 'Organizer', to: ROUTE_PATHS.organizerDashboard }, { label: 'Create event' }]} />
      <PageHeader
        eyebrow="Smart contract administration"
        title="Create Event"
        description="Publish a new event to the EventTicketing contract. The rules you set here are enforced on-chain for every primary sale and resale."
      />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <GlassCard title="Event details">
            <CreateEventForm
              isSubmitting={transaction.isSubmitting}
              onSubmit={handleSubmit}
              onValuesChange={setPreviewValues}
            />
            <TransactionStatus {...transaction} className="mt-5" />
          </GlassCard>
        </div>
        <div className="lg:col-span-5">
          <EventRulesPreview values={previewValues} />
        </div>
      </div>
    </>
  )
}
