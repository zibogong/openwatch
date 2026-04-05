import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { SnapshotSeries } from '@/types/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const days = Math.min(90, Math.max(7, parseInt(searchParams.get('days') ?? '30')))
  const department = searchParams.get('department')

  let rows: SnapshotSeries[]

  if (department) {
    rows = await sql`
      SELECT snapshot_at, department_name, active_count, new_count, closed_count
      FROM department_snapshots
      WHERE snapshot_at >= NOW() - (${days} || ' days')::interval
        AND department_name = ${department}
      ORDER BY snapshot_at ASC
    ` as SnapshotSeries[]
  } else {
    rows = await sql`
      SELECT snapshot_at, department_name, active_count, new_count, closed_count
      FROM department_snapshots
      WHERE snapshot_at >= NOW() - (${days} || ' days')::interval
      ORDER BY snapshot_at ASC
    ` as SnapshotSeries[]
  }

  return NextResponse.json({ series: rows })
}
