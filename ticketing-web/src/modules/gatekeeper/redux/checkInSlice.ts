import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type CheckInOutcome = 'admitted' | 'rejected'

export interface CheckInLogEntry {
  id: string
  tokenId: string
  eventName: string | null
  holder: string
  outcome: CheckInOutcome
  reason: string | null
  txHash: string | null
  /** Unix timestamp in milliseconds. */
  recordedAt: number
}

export interface CheckInState {
  /** Nonces of passes already scanned at this gate — each QR may be scanned once. */
  scannedNonces: string[]
  log: CheckInLogEntry[]
}

const MAX_LOG_ENTRIES = 20

const initialState: CheckInState = {
  scannedNonces: [],
  log: [],
}

const checkInSlice = createSlice({
  name: 'gatekeeperCheckIn',
  initialState,
  reducers: {
    passScanned(state, action: PayloadAction<string>) {
      if (!state.scannedNonces.includes(action.payload)) state.scannedNonces.push(action.payload)
    },
    checkInRecorded(state, action: PayloadAction<CheckInLogEntry>) {
      state.log = [action.payload, ...state.log].slice(0, MAX_LOG_ENTRIES)
    },
  },
})

export const { passScanned, checkInRecorded } = checkInSlice.actions
export default checkInSlice.reducer
