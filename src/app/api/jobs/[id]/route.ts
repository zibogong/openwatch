import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import type { JobRow } from '@/types/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const rows = await sql`SELECT * FROM jobs WHERE id = ${parseInt(id)}` as JobRow[]

  if (!rows.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(rows[0])
}
