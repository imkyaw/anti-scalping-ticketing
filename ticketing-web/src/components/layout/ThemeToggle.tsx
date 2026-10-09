import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { selectThemeMode } from '@/redux/selectors'
import { themeToggled } from '@/redux/slices/themeSlice'

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Tooltip title={label}>
      <Button
        icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
        aria-label={label}
        onClick={() => dispatch(themeToggled())}
      />
    </Tooltip>
  )
}
