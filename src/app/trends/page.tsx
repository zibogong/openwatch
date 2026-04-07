import { sql } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DepartmentBarChart } from '@/components/charts/DepartmentBarChart'
import { TrendAreaChart } from '@/components/charts/TrendAreaChart'
import { ActiveClosedPieChart } from '@/components/charts/ActiveClosedPieChart'
import { NewJobsTimelineChart } from '@/components/charts/NewJobsTimelineChart'
import type { DepartmentStat, SnapshotSeries, StatsResponse } from '@/types/db'

export const dynamic = 'force-dynamic'

async function getStats(): Promise<StatsResponse> {
  const [totalActive] = await sql`SELECT COUNT(*)::int AS count FROM jobs WHERE status = 'active'` as { count: number }[]
  const [newThisWeek] = await sql`SELECT COUNT(*)::int AS count FROM jobs WHERE first_seen_at >= NOW() - INTERVAL '7 days'` as { count: number }[]
  const [closedThisWeek] = await sql`SELECT COUNT(*)::int AS count FROM jobs WHERE closed_at >= NOW() - INTERVAL '7 days'` as { count: number }[]
  const byDept = await sql`
    SELECT department_name AS department, COUNT(*)::int AS count
    FROM jobs WHERE status = 'active'
    GROUP BY department_name ORDER BY count DESC
  ` as { department: string | null; count: number }[]
  const syncRows = await sql`SELECT ran_at FROM sync_runs ORDER BY ran_at DESC LIMIT 2` as { ran_at: string }[]

  return {
    total_active: totalActive?.count ?? 0,
    new_this_week: newThisWeek?.count ?? 0,
    closed_this_week: closedThisWeek?.count ?? 0,
    by_department: byDept.map((r) => ({ department: r.department ?? 'Uncategorized', count: r.count })),
    last_sync: syncRows[0]?.ran_at ?? null,
    previous_sync: syncRows[1]?.ran_at ?? null,
  }
}

async function getSnapshots(): Promise<SnapshotSeries[]> {
  const rows = await sql`
    SELECT snapshot_at, department_name, active_count, new_count, closed_count
    FROM department_snapshots
    WHERE snapshot_at >= NOW() - INTERVAL '30 days'
    ORDER BY snapshot_at ASC
  `
  return rows as unknown as SnapshotSeries[]
}

export default async function TrendsPage() {
  const [stats, snapshots] = await Promise.all([getStats(), getSnapshots()])

  return (
    <div className="space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">Trends</h1>
        <p className="text-muted-foreground mt-1">
          Hiring distribution and trends over time
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Jobs by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <DepartmentBarChart data={stats.by_department} height={320} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active vs Closed (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <ActiveClosedPieChart stats={stats} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Trends (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendAreaChart series={snapshots} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New Jobs Per Day (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <NewJobsTimelineChart series={snapshots} />
        </CardContent>
      </Card>
    </div>
  )
}
