export type ThemeMode = 'dark' | 'light'

/** Must match the key read by the inline script in index.html (prevents a flash of the wrong theme). */
export const THEME_STORAGE_KEY = 'fairticket.theme'

/** Browser UI colour (mobile address bar) for each mode; mirrors --color-canvas in index.css. */
export const THEME_META_COLORS: Record<ThemeMode, string> = {
  dark: '#090d16',
  light: '#f5f7fb',
}

/** index.html sets data-theme before React loads, so Redux starts from the same value. */
export function readInitialThemeMode(): ThemeMode {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}
