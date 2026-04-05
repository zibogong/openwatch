import Link from 'next/link'
import { JobStatusBadge } from './JobStatusBadge'
import { formatRelative, formatDate } from '@/lib/utils'
import type { JobRow } from '@/types/db'

interface Props {
  job: JobRow
}

const ONE_DAY_MS = 86400000

export function JobCard({ job }: Props) {
  const isNew =
    job.status === 'active' &&
    Date.now() - new Date(job.first_seen_at).getTime() < ONE_DAY_MS * 3

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <div className="bg-card border border-border rounded-2xl px-5 py-4 hover:border-foreground/20 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate group-hover:underline">{job.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {job.department_name ?? 'Uncategorized'}
              {job.location_name ? ` · ${job.location_name}` : ''}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <JobStatusBadge status={job.status} isNew={isNew} />
            <span className="text-xs text-muted-foreground">
              {job.status === 'closed'
                ? formatDate(job.closed_at)
                : formatRelative(job.first_seen_at)}
            </span>
          </div>
        </div>
        {job.insight_strategic && (
          <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed border-t border-border pt-3">
            {job.insight_strategic}
          </p>
        )}
      </div>
    </Link>
  )
}
