'use client'
import useSWR from 'swr'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/utils'

interface SummaryData {
  summary: string | null
  generated_at: string
  jobs_active: number
  jobs_new: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function GlobalSummary() {
  const { data, isLoading } = useSWR<SummaryData>('/api/summary', fetcher, {
    refreshInterval: 300000,
  })

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    )
  }

  if (!data?.summary) return null

  return (
    <div
      className="rounded-2xl bg-card border border-border p-4"
      style={{ borderLeft: '3px solid var(--primary)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          AI Signal
        </span>
        <span className="text-xs text-muted-foreground">
          {formatRelative(data.generated_at)}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-foreground/80">
        {data.summary}
      </p>
    </div>
  )
}
