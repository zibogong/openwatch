import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const [totalActive] = await sql`
    SELECT COUNT(*)::int AS count FROM jobs WHERE status = 'active'
  ` as { count: number }[]

  const [newThisWeek] = await sql`
    SELECT COUNT(*)::int AS count FROM jobs
    WHERE first_seen_at >= NOW() - INTERVAL '7 days'
  ` as { count: number }[]

  const [closedThisWeek] = await sql`
    SELECT COUNT(*)::int AS count FROM jobs
    WHERE closed_at >= NOW() - INTERVAL '7 days'
  ` as { count: number }[]

  const byDept = await sql`
    SELECT department_name AS department, COUNT(*)::int AS count
    FROM jobs
    WHERE status = 'active'
    GROUP BY department_name
    ORDER BY count DESC
  ` as { department: string | null; count: number }[]

  const syncRows = await sql`
    SELECT ran_at FROM sync_runs ORDER BY ran_at DESC LIMIT 2
  ` as { ran_at: string }[]

  const lastSync = syncRows[0]?.ran_at ?? null
  // Previous sync time: used to decide if a job is truly "new" (appeared after last sync)
  const previousSync = syncRows[1]?.ran_at ?? null

  return NextResponse.json({
    total_active: totalActive?.count ?? 0,
    new_this_week: newThisWeek?.count ?? 0,
    closed_this_week: closedThisWeek?.count ?? 0,
    by_department: byDept.map((r) => ({
      department: r.department ?? 'Uncategorized',
      count: r.count,
    })),
    last_sync: lastSync,
    previous_sync: previousSync,
  })
}
