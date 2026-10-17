import { useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { selectThemeMode } from '@/redux/selectors'
import { THEME_META_COLORS, THEME_STORAGE_KEY } from '@/theme/themeMode'

/**
 * Mount once at the app root: mirrors the Redux theme onto <html data-theme>
 * (which switches the Tailwind tokens in index.css) and remembers the choice.
 */
export function useThemeSync(): void {
  const mode = useAppSelector(selectThemeMode)

  useEffect(() => {
    document.documentElement.dataset.theme = mode
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_META_COLORS[mode])
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch {
      // Storage can be blocked (private mode); the theme still applies for this visit.
    }
  }, [mode])
}
