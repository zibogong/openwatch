'use client'
import useSWR from 'swr'
import type { SnapshotSeries } from '@/types/db'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSnapshots(days = 30) {
  return useSWR<{ series: SnapshotSeries[] }>(
    `/api/snapshots?days=${days}`,
    fetcher,
    { refreshInterval: 300000 }
  )
}
