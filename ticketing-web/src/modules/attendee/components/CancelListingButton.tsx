import { CloseCircleOutlined } from '@ant-design/icons'
import { App, Button, Popconfirm } from 'antd'
import { useTransaction } from '@/hooks/useTransaction'
import { cancelResale } from '@/services/resaleService'

interface CancelListingButtonProps {
  tokenId: bigint
  onCancelled: () => void
  block?: boolean
}

export function CancelListingButton({ tokenId, onCancelled, block = false }: CancelListingButtonProps) {
  const { message } = App.useApp()
  const transaction = useTransaction()

  const handleCancel = async () => {
    const result = await transaction.execute(() => cancelResale(tokenId))
    if (result.ok) {
      message.success('Listing cancelled')
      onCancelled()
    } else if (result.error) {
      message.warning(result.error)
    }
  }

  return (
    <Popconfirm
      title="Cancel this resale listing?"
      description="The ticket stays in your wallet."
      okText="Cancel listing"
      cancelText="Keep"
      okButtonProps={{ danger: true }}
      onConfirm={handleCancel}
    >
      <Button danger block={block} icon={<CloseCircleOutlined />} loading={transaction.isSubmitting}>
        Cancel listing
      </Button>
    </Popconfirm>
  )
}
