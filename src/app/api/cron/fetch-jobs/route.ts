import { NextRequest, NextResponse } from 'next/server'
import { syncJobs } from '@/lib/job-sync'

export const maxDuration = 60

async function handler(req: NextRequest) {
  // Vercel cron sends GET with Authorization: Bearer <CRON_SECRET>
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncJobs()
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Sync failed:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
