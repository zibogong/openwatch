'use client'
import useSWR from 'swr'
import type { JobsResponse } from '@/types/db'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface UseJobsParams {
  status?: string
  department?: string
  page?: number
  limit?: number
}

function buildUrl(params: UseJobsParams): string {
  const p = new URLSearchParams()
  if (params.status) p.set('status', params.status)
  if (params.department) p.set('department', params.department)
  if (params.page) p.set('page', String(params.page))
  if (params.limit) p.set('limit', String(params.limit))
  return `/api/jobs?${p.toString()}`
}

export function useJobs(params: UseJobsParams = {}, fallbackData?: JobsResponse) {
  const url = buildUrl(params)
  return useSWR<JobsResponse>(url, fetcher, {
    fallbackData,
    refreshInterval: 60000,
  })
}
