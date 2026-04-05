'use client'
import Link from 'next/link'
import { useInsights } from '@/hooks/useInsights'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/utils'

const PANEL_COLORS = {
  strategic: {
    dot: 'bg-blue-500',
    label: 'Strategy',
    labelColor: 'text-blue-600',
  },
  financial: {
    dot: 'bg-amber-500',
    label: 'Market Signal',
    labelColor: 'text-amber-600',
  },
  ai: {
    dot: 'bg-violet-500',
    label: 'AI Replaceability',
    labelColor: 'text-violet-600',
  },
}

export function DashboardInsights() {
  const { data, isLoading } = useInsights({ limit: 5 })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  const jobs = data?.jobs ?? []
  if (!jobs.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Insights are being generated. Check back shortly.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
          <div className="bg-card border border-border rounded-2xl p-4 hover:border-foreground/20 hover:shadow-sm transition-all">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate group-hover:underline">
                  {job.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {job.department_name ?? 'Uncategorized'} · {formatRelative(job.insight_generated_at)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 mt-0.5">→</span>
            </div>

            {/* Strategic insight preview */}
            {job.insight_strategic && (
              <div className="flex gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${PANEL_COLORS.strategic.dot}`} />
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.insight_strategic}
                </p>
              </div>
            )}
          </div>
        </Link>
      ))}

      <Link
        href="/insights"
        className="block text-center text-sm font-medium text-muted-foreground hover:text-foreground py-2 transition-colors"
      >
        View all insights →
      </Link>
    </div>
  )
}
