import { PlusCircleOutlined } from '@ant-design/icons'
import { Button, Form, Input, InputNumber } from 'antd'
import type { CreateEventInput } from '@/types/ticketing'
import { parseEthInput } from '@/utils/ethInput'

export interface CreateEventFormValues {
  name: string
  facePrice: string
  supply: number
  perWalletCap: number
}

interface CreateEventFormProps {
  isSubmitting: boolean
  onSubmit: (input: CreateEventInput) => void
  onValuesChange: (values: Partial<CreateEventFormValues>) => void
}

const INITIAL_VALUES: Partial<CreateEventFormValues> = { supply: 100, perWalletCap: 2 }

export function CreateEventForm({ isSubmitting, onSubmit, onValuesChange }: CreateEventFormProps) {
  const handleFinish = (values: CreateEventFormValues) => {
    const facePrice = parseEthInput(values.facePrice)
    if (facePrice === null) return
    onSubmit({
      name: values.name.trim(),
      facePrice,
      supply: BigInt(values.supply),
      perWalletCap: BigInt(values.perWalletCap),
    })
  }

  return (
    <Form<CreateEventFormValues>
      layout="vertical"
      size="large"
      requiredMark={false}
      initialValues={INITIAL_VALUES}
      disabled={isSubmitting}
      onFinish={handleFinish}
      onValuesChange={(_, allValues) => onValuesChange(allValues)}
    >
      <Form.Item
        name="name"
        label="Event name"
        rules={[{ required: true, whitespace: true, message: 'Event name is required' }, { max: 120 }]}
      >
        <Input placeholder="Campus Concert 2026" />
      </Form.Item>

      <Form.Item
        name="facePrice"
        label="Face price (ETH)"
        extra="Also the maximum resale price for every ticket of this event."
        rules={[
          { required: true, message: 'Face price is required' },
          {
            validator: (_, value?: string) => {
              const wei = parseEthInput(value)
              return wei !== null && wei > 0n
                ? Promise.resolve()
                : Promise.reject(new Error('Enter an ETH amount greater than 0'))
            },
          },
        ]}
      >
        <InputNumber<string> stringMode min="0" step="0.001" placeholder="0.01" suffix="ETH" className="w-full! font-mono!" />
      </Form.Item>

      <div className="grid gap-x-4 sm:grid-cols-2">
        <Form.Item name="supply" label="Ticket supply" rules={[{ required: true, message: 'Supply is required' }]}>
          <InputNumber min={1} precision={0} className="w-full! font-mono!" />
        </Form.Item>
        <Form.Item
          name="perWalletCap"
          label="Max tickets per wallet"
          rules={[{ required: true, message: 'Per-wallet cap is required' }]}
        >
          <InputNumber min={1} precision={0} className="w-full! font-mono!" />
        </Form.Item>
      </div>

      <Button type="primary" htmlType="submit" block icon={<PlusCircleOutlined />} loading={isSubmitting}>
        {isSubmitting ? 'Deploying event on-chain…' : 'Create event'}
      </Button>
    </Form>
  )
}
