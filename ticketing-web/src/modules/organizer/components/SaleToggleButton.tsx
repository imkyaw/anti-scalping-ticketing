import { CloseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import { useTransaction } from '@/hooks/useTransaction'
import { closeSale, openSale } from '@/services/eventService'
import type { TicketingEvent } from '@/types/ticketing'

interface SaleToggleButtonProps {
  event: TicketingEvent
  onChanged: () => void
}

export function SaleToggleButton({ event, onChanged }: SaleToggleButtonProps) {
  const { message } = App.useApp()
  const transaction = useTransaction()

  const handleToggle = async () => {
    const result = await transaction.execute(() =>
      event.saleOpen ? closeSale(event.eventId) : openSale(event.eventId),
    )
    if (result.ok) {
      message.success(event.saleOpen ? 'Ticket sales closed' : 'Ticket sales opened')
      onChanged()
    } else if (result.error) {
      message.warning(result.error)
    }
  }

  return event.saleOpen ? (
    <Button danger type="primary" icon={<CloseCircleOutlined />} loading={transaction.isSubmitting} onClick={handleToggle}>
      Close sale
    </Button>
  ) : (
    <Button
      type="primary"
      icon={<PlayCircleOutlined />}
      loading={transaction.isSubmitting}
      onClick={handleToggle}
      className="bg-success! hover:bg-success/85!"
    >
      Start sale
    </Button>
  )
}
