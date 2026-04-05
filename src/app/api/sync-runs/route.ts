import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { SyncRun } from '@/types/db'

export async function GET() {
  const rows = await sql`
    SELECT * FROM sync_runs
    ORDER BY ran_at DESC
    LIMIT 20
  ` as SyncRun[]

  return NextResponse.json({ runs: rows })
}
