import { createSlice } from '@reduxjs/toolkit'
import { readInitialThemeMode, type ThemeMode } from '@/theme/themeMode'

export interface ThemeState {
  mode: ThemeMode
}

const initialState: ThemeState = {
  mode: readInitialThemeMode(),
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    themeToggled(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
    },
  },
})

export const { themeToggled } = themeSlice.actions
export default themeSlice.reducer
