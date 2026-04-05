import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql`
    SELECT summary, generated_at, jobs_active, jobs_new
    FROM global_summary
    ORDER BY generated_at DESC
    LIMIT 1
  ` as { summary: string; generated_at: string; jobs_active: number; jobs_new: number }[]

  if (!rows.length) {
    return NextResponse.json({ summary: null })
  }

  return NextResponse.json(rows[0])
}
