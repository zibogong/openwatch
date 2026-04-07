import Link from 'next/link'
import { JobStatusBadge } from './JobStatusBadge'
import { formatRelative, formatDate } from '@/lib/utils'
import type { JobRow } from '@/types/db'

interface Props {
  job: JobRow
  previousSync?: string | null
}

export function JobCard({ job, previousSync }: Props) {
  // A job is truly "new" only if it first appeared after the previous sync run.
  // This prevents a full re-seed from marking all jobs as new.
  const isNew =
    job.status === 'active' &&
    !!previousSync &&
    new Date(job.first_seen_at) > new Date(previousSync)

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
