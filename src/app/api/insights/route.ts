import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { JobRow } from '@/types/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const department = searchParams.get('department')
  const offset = (page - 1) * limit

  let rows: JobRow[]
  let countRows: { count: number }[]

  if (department) {
    rows = await sql`
      SELECT * FROM jobs
      WHERE insight_generated_at IS NOT NULL AND department_name = ${department}
      ORDER BY insight_generated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as JobRow[]
    countRows = await sql`
      SELECT COUNT(*)::int AS count FROM jobs
      WHERE insight_generated_at IS NOT NULL AND department_name = ${department}
    ` as { count: number }[]
  } else {
    rows = await sql`
      SELECT * FROM jobs
      WHERE insight_generated_at IS NOT NULL
      ORDER BY insight_generated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as JobRow[]
    countRows = await sql`
      SELECT COUNT(*)::int AS count FROM jobs WHERE insight_generated_at IS NOT NULL
    ` as { count: number }[]
  }

  return NextResponse.json({
    jobs: rows,
    total: countRows[0]?.count ?? 0,
    page,
  })
}
