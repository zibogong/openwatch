'use client'
import Link from 'next/link'
import { useJobs } from '@/hooks/useJobs'
import { useStats } from '@/hooks/useStats'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  dark?: boolean
}

export function RecentChanges({ dark }: Props) {
  const { data: newData, isLoading: newLoading } = useJobs({ status: 'active', limit: 6 })
  const { data: closedData, isLoading: closedLoading } = useJobs({ status: 'closed', limit: 4 })
  const { data: stats } = useStats()

  const previousSync = stats?.previous_sync ? new Date(stats.previous_sync) : null

  const recentNew = newData?.jobs.filter(
    (j) => previousSync && new Date(j.first_seen_at) > previousSync
  ) ?? []

  const recentClosed = closedData?.jobs.filter(
    (j) => j.closed_at && previousSync && new Date(j.closed_at) > previousSync
  ) ?? []

  const isLoading = newLoading || closedLoading

  // Dark variant classes — lighter card so text is legible
  const labelClass   = dark ? 'text-white/50 tracking-widest' : 'text-muted-foreground tracking-widest'
  const titleClass   = dark ? 'text-white'                    : 'text-foreground'
  const metaClass    = dark ? 'text-white/60'                 : 'text-muted-foreground'
  const dividerClass = dark ? 'bg-white/10'                   : 'bg-border'
  const strikeMeta   = dark ? 'text-white/40'                 : 'text-muted-foreground'

  return (
    <div className="space-y-4 flex-1">
      {/* Opened */}
      <div>
        <p className={cn('text-[10px] font-bold uppercase mb-2', labelClass)}>Opened</p>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className={cn('h-7 w-full', dark && 'opacity-20')} />
            ))}
          </div>
        ) : recentNew.length === 0 ? (
          <p className={cn('text-xs', metaClass)}>No new jobs this week.</p>
        ) : (
          <ul className="space-y-2.5">
            {recentNew.slice(0, 5).map((j) => (
              <li key={j.id} className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/jobs/${j.id}`}
                  className={cn('text-[13px] leading-snug hover:underline truncate', titleClass)}
                >
                  {j.title}
                </Link>
                <span className={cn('text-[11px] shrink-0 tabular-nums', metaClass)}>
                  {formatRelative(j.first_seen_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={cn('h-px w-full', dividerClass)} />

      {/* Closed */}
      <div>
        <p className={cn('text-[10px] font-bold uppercase mb-2', labelClass)}>Closed</p>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className={cn('h-7 w-full', dark && 'opacity-20')} />
            ))}
          </div>
        ) : recentClosed.length === 0 ? (
          <p className={cn('text-xs', metaClass)}>No closed jobs this week.</p>
        ) : (
          <ul className="space-y-2.5">
            {recentClosed.slice(0, 4).map((j) => (
              <li key={j.id} className="flex items-baseline justify-between gap-3">
                <Link
                  href={`/jobs/${j.id}`}
                  className={cn('text-[13px] leading-snug hover:underline truncate line-through', strikeMeta)}
                >
                  {j.title}
                </Link>
                <span className={cn('text-[11px] shrink-0 tabular-nums', metaClass)}>
                  {formatRelative(j.closed_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
