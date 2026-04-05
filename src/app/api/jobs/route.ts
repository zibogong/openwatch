import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { JobRow } from '@/types/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? 'active'
  const department = searchParams.get('department')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
  const offset = (page - 1) * limit

  let rows: JobRow[]
  let countRows: { count: number }[]

  if (status === 'all') {
    if (department) {
      rows = await sql`
        SELECT * FROM jobs
        WHERE department_name = ${department}
        ORDER BY first_seen_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as JobRow[]
      countRows = await sql`
        SELECT COUNT(*)::int AS count FROM jobs WHERE department_name = ${department}
      ` as { count: number }[]
    } else {
      rows = await sql`
        SELECT * FROM jobs
        ORDER BY first_seen_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as JobRow[]
      countRows = await sql`SELECT COUNT(*)::int AS count FROM jobs` as { count: number }[]
    }
  } else {
    if (department) {
      rows = await sql`
        SELECT * FROM jobs
        WHERE status = ${status} AND department_name = ${department}
        ORDER BY first_seen_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as JobRow[]
      countRows = await sql`
        SELECT COUNT(*)::int AS count FROM jobs WHERE status = ${status} AND department_name = ${department}
      ` as { count: number }[]
    } else {
      rows = await sql`
        SELECT * FROM jobs
        WHERE status = ${status}
        ORDER BY first_seen_at DESC
        LIMIT ${limit} OFFSET ${offset}
      ` as JobRow[]
      countRows = await sql`
        SELECT COUNT(*)::int AS count FROM jobs WHERE status = ${status}
      ` as { count: number }[]
    }
  }

  return NextResponse.json({
    jobs: rows,
    total: countRows[0]?.count ?? 0,
    page,
  })
}
