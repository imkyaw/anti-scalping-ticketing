import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchValidatorEvents } from '@/services/validationService'

export function useValidatorEvents(account: string) {
  const loader = useCallback(() => fetchValidatorEvents(account), [account])
  return useAsyncData(loader)
}
