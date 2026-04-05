'use client'
import useSWR from 'swr'
import type { InsightsResponse } from '@/types/db'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface UseInsightsParams {
  department?: string
  page?: number
  limit?: number
}

function buildUrl(params: UseInsightsParams): string {
  const p = new URLSearchParams()
  if (params.department) p.set('department', params.department)
  if (params.page) p.set('page', String(params.page))
  if (params.limit) p.set('limit', String(params.limit))
  return `/api/insights?${p.toString()}`
}

export function useInsights(params: UseInsightsParams = {}) {
  const url = buildUrl(params)
  return useSWR<InsightsResponse>(url, fetcher, { refreshInterval: 120000 })
}
