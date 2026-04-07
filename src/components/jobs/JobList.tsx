'use client'
import { useSearchParams } from 'next/navigation'
import { useJobs } from '@/hooks/useJobs'
import { useStats } from '@/hooks/useStats'
import { JobCard } from './JobCard'
import { Skeleton } from '@/components/ui/skeleton'
import type { JobsResponse } from '@/types/db'

interface Props {
  fallbackData?: JobsResponse
}

export function JobList({ fallbackData }: Props) {
  const params = useSearchParams()
  const status = params.get('status') ?? 'active'
  const department = params.get('department') ?? undefined

  const { data, isLoading } = useJobs({ status, department, limit: 100 }, fallbackData)
  const { data: stats } = useStats()

  if (isLoading && !data) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!data?.jobs.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        No jobs found.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{data.total} jobs</p>
      {data.jobs.map((job) => (
        <JobCard key={job.id} job={job} previousSync={stats?.previous_sync ?? null} />
      ))}
    </div>
  )
}
