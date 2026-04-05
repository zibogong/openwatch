import { NextRequest, NextResponse } from 'next/server'
import { syncJobs } from '@/lib/job-sync'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  // Vercel cron auth — skip in dev
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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

// Allow GET for manual triggering in dev
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
  return POST(req)
}
