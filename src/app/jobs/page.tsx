import { Suspense } from 'react'
import { JobFilters } from '@/components/jobs/JobFilters'
import { JobList } from '@/components/jobs/JobList'
import { Skeleton } from '@/components/ui/skeleton'

export const revalidate = 60

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">Job Listings</h1>
        <p className="text-muted-foreground mt-1">
          All Anthropic job postings tracked by OpenWatch
        </p>
      </div>

      <Suspense>
        <JobFilters />
      </Suspense>

      <Suspense fallback={
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      }>
        <JobList />
      </Suspense>
    </div>
  )
}
