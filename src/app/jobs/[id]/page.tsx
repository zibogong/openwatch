import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sql } from '@/lib/db'
import { InsightCard } from '@/components/insights/InsightCard'
import { JobStatusBadge } from '@/components/jobs/JobStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatDate, unescapeHtml } from '@/lib/utils'
import type { JobRow } from '@/types/db'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params
  const rows = await sql`SELECT * FROM jobs WHERE id = ${parseInt(id)}` as JobRow[]

  if (!rows.length) notFound()

  const job = rows[0]
  const isNew =
    job.status === 'active' &&
    Date.now() - new Date(job.first_seen_at).getTime() < 86400000 * 3

  const cleanHtml = job.content_html ? unescapeHtml(job.content_html) : null

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/jobs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Jobs
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{job.title}</h1>
          <JobStatusBadge status={job.status} isNew={isNew} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="font-medium">
            {job.department_name ?? 'Uncategorized'}
          </Badge>
          <span>{job.location_name ?? 'Remote'}</span>
          <span className="text-border">·</span>
          <span>First seen {formatDate(job.first_seen_at)}</span>
          {job.closed_at && (
            <>
              <span className="text-border">·</span>
              <span className="text-red-500">Closed {formatDate(job.closed_at)}</span>
            </>
          )}
        </div>
        {job.absolute_url && (
          <a
            href={job.absolute_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Apply on Anthropic Careers →
          </a>
        )}
      </div>

      <Separator />

      {/* AI Insights */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">AI Insights</h2>
        <InsightCard job={job} />
      </div>

      {/* Job Description */}
      {cleanHtml && (
        <>
          <Separator />
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Job Description</h2>
            <div
              className="job-content"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
            />
          </div>
        </>
      )}
    </div>
  )
}
