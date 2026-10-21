import { theme, type ThemeConfig } from 'antd'
import type { ThemeMode } from './themeMode'

const sharedToken: ThemeConfig['token'] = {
  colorPrimary: '#6366F1',
  colorSuccess: '#10B981',
  colorError: '#EF4444',
  colorWarning: '#F59E0B',
  colorInfo: '#6366F1',
  fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  fontFamilyCode: "'JetBrains Mono', ui-monospace, monospace",
  borderRadius: 8,
  controlHeight: 40,
}

const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...sharedToken,
    colorBgBase: '#090D16',
    colorBgContainer: '#111827',
    colorBgElevated: '#161E2E',
    colorBorder: '#1F2937',
    colorBorderSecondary: '#1F2937',
    colorText: '#F9FAFB',
    colorTextSecondary: '#9CA3AF',
  },
  components: {
    Button: {
      primaryShadow: '0 0 16px rgba(99, 102, 241, 0.35)',
      fontWeight: 600,
    },
    Modal: {
      contentBg: '#111827',
      headerBg: '#111827',
    },
    Segmented: {
      itemSelectedBg: '#1F2937',
      trackBg: 'rgba(17, 24, 39, 0.8)',
    },
  },
}

// Mirrors the :root[data-theme='light'] tokens in index.css.
const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...sharedToken,
    colorBgLayout: '#F5F7FB',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBorder: '#CBD5E1',
    colorBorderSecondary: '#E2E8F0',
    colorText: '#0F172A',
    colorTextSecondary: '#475569',
  },
  components: {
    Button: {
      primaryShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
      fontWeight: 600,
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
    },
    Segmented: {
      itemSelectedBg: '#FFFFFF',
      trackBg: '#E5E9F2',
    },
  },
}

export const antdThemes: Record<ThemeMode, ThemeConfig> = {
  dark: darkTheme,
  light: lightTheme,
}
