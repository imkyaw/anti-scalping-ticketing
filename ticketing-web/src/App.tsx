import { App as AntdApp, ConfigProvider } from 'antd'
import { useThemeSync } from '@/hooks/useThemeSync'
import { useWalletSync } from '@/hooks/useWalletSync'
import { useAppSelector } from '@/redux/hooks'
import { selectThemeMode } from '@/redux/selectors'
import { AppRouter } from '@/routes/AppRouter'
import { antdThemes } from '@/theme/antdTheme'

function App() {
  useWalletSync()
  useThemeSync()
  const themeMode = useAppSelector(selectThemeMode)

  return (
    <ConfigProvider theme={antdThemes[themeMode]}>
      <AntdApp>
        <AppRouter />
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
