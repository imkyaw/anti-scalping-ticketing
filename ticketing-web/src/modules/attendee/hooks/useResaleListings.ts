import { useAsyncData } from '@/hooks/useAsyncData'
import { fetchActiveListings } from '@/services/resaleService'

export function useResaleListings() {
  return useAsyncData(fetchActiveListings)
}
