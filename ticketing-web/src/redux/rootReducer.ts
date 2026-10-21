import { combineReducers } from '@reduxjs/toolkit'
import checkInReducer from '@/modules/gatekeeper/redux/checkInSlice'
import themeReducer from './slices/themeSlice'
import walletReducer from './slices/walletSlice'

export const rootReducer = combineReducers({
  wallet: walletReducer,
  theme: themeReducer,
  gatekeeperCheckIn: checkInReducer,
})
