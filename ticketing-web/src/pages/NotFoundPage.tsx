import { CompassOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Link } from 'react-router'
import { EmptyState } from '@/components/feedback/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={<CompassOutlined />}
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Link to="/">
          <Button type="primary">Go to home</Button>
        </Link>
      }
    />
  )
}
