'use client'
import Link from 'next/link'
import { useInsights } from '@/hooks/useInsights'
import { InsightCard } from './InsightCard'
import { Skeleton } from '@/components/ui/skeleton'
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge'
import { formatRelative } from '@/lib/utils'

export function InsightFeed() {
  const { data, isLoading } = useInsights({ limit: 30 })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!data?.jobs.length) {
    return (
      <div className="bg-card border border-border rounded-2xl px-6 py-16 text-center text-sm text-muted-foreground">
        No insights yet. Trigger a sync to generate insights for new jobs.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground px-1">{data.total} jobs analyzed</p>

      {data.jobs.map((job) => (
        <div key={job.id} className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Job header row */}
          <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-border">
            <div className="min-w-0">
              <Link
                href={`/jobs/${job.id}`}
                className="font-semibold text-sm hover:underline leading-snug block truncate"
                style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
              >
                {job.title}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">
                {job.department_name ?? 'Uncategorized'}
                {' · '}
                {formatRelative(job.insight_generated_at)}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              <JobStatusBadge status={job.status} />
            </div>
          </div>

          {/* 3-panel insights */}
          <div className="p-4">
            <InsightCard job={job} compact />
          </div>
        </div>
      ))}
    </div>
  )
}
