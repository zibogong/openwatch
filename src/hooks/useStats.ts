'use client'
import useSWR from 'swr'
import type { StatsResponse } from '@/types/db'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useStats(fallbackData?: StatsResponse) {
  return useSWR<StatsResponse>('/api/stats', fetcher, {
    fallbackData,
    refreshInterval: 60000,
  })
}
