import { sql } from '@/lib/db'
import { fetchAllJobs } from '@/lib/greenhouse'
import { generateInsight, generateGlobalSummary, INSIGHT_MODEL } from '@/lib/claude'
import type { GreenhouseJob } from '@/types/greenhouse'
import type { JobRow } from '@/types/db'

// p-limit is ESM-only; use dynamic import
async function getPLimit(concurrency: number) {
  const { default: pLimit } = await import('p-limit')
  return pLimit(concurrency)
}

export interface SyncResult {
  jobsFetched: number
  newJobs: number
  closedJobs: number
  insightsDone: number
  durationMs: number
  error?: string
}

export async function syncJobs(): Promise<SyncResult> {
  const start = Date.now()
  let newJobCount = 0
  let closedJobCount = 0
  let insightsDone = 0

  // 0. Guard: skip if a sync completed in the last 45 seconds (prevents concurrent runs)
  const recentRuns = await sql`
    SELECT ran_at FROM sync_runs
    WHERE ran_at > NOW() - INTERVAL '45 seconds'
    LIMIT 1
  ` as { ran_at: string }[]
  if (recentRuns.length > 0) {
    return { jobsFetched: 0, newJobs: 0, closedJobs: 0, insightsDone: 0, durationMs: 0 }
  }

  // Wrap everything so failures are always logged to sync_runs
  try {
    return await _syncJobs(start)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const durationMs = Date.now() - start
    await sql`
      INSERT INTO sync_runs (jobs_fetched, new_jobs, closed_jobs, insights_done, error_message, duration_ms)
      VALUES (0, 0, 0, 0, ${message}, ${durationMs})
    `.catch(() => {}) // don't throw if DB itself is down
    throw err
  }
}

async function _syncJobs(start: number): Promise<SyncResult> {
  let newJobCount = 0
  let closedJobCount = 0
  let insightsDone = 0

  // 1. Fetch from Greenhouse
  const apiJobs = await fetchAllJobs()
  const apiIds = new Set(apiJobs.map((j) => j.id))

  // 2. Get all currently-active jobs from DB
  const activeRows = await sql`
    SELECT id FROM jobs WHERE status = 'active'
  ` as { id: number }[]
  const activeDbIds = new Set(activeRows.map((r) => r.id))

  // 3. Determine new / closed / existing
  const newJobs = apiJobs.filter((j) => !activeDbIds.has(j.id))
  const closedIds = [...activeDbIds].filter((id) => !apiIds.has(id))
  const existingJobs = apiJobs.filter((j) => activeDbIds.has(j.id))

  // 4. Insert new jobs
  for (const job of newJobs) {
    const dept = job.departments?.[0]?.name ?? null
    const loc = job.location?.name ?? null
    const updatedAt = job.updated_at ? new Date(job.updated_at) : null
    await sql`
      INSERT INTO jobs (id, title, department_name, location_name, absolute_url, content_html, greenhouse_updated_at)
      VALUES (
        ${job.id},
        ${job.title},
        ${dept},
        ${loc},
        ${job.absolute_url},
        ${job.content ?? null},
        ${updatedAt}
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        department_name = EXCLUDED.department_name,
        location_name = EXCLUDED.location_name,
        absolute_url = EXCLUDED.absolute_url,
        content_html = EXCLUDED.content_html,
        greenhouse_updated_at = EXCLUDED.greenhouse_updated_at,
        last_seen_at = NOW(),
        status = 'active',
        closed_at = NULL
    `
  }
  newJobCount = newJobs.length

  // 5. Mark closed
  if (closedIds.length > 0) {
    await sql`
      UPDATE jobs
      SET status = 'closed', closed_at = NOW()
      WHERE id = ANY(${closedIds}::bigint[])
    `
    closedJobCount = closedIds.length
  }

  // 6. Update last_seen_at for existing
  if (existingJobs.length > 0) {
    const existingIds = existingJobs.map((j) => j.id)
    await sql`
      UPDATE jobs
      SET last_seen_at = NOW()
      WHERE id = ANY(${existingIds}::bigint[])
    `
  }

  // 7. Write department snapshots
  const deptCounts = computeDeptCounts(apiJobs, newJobs, closedIds)
  for (const [dept, counts] of Object.entries(deptCounts)) {
    await sql`
      INSERT INTO department_snapshots (department_name, active_count, new_count, closed_count)
      VALUES (${dept}, ${counts.active}, ${counts.new}, ${counts.closed})
    `
  }

  // 8. Generate insights for new jobs + retry backfill (up to 10)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('Skipping insight generation: ANTHROPIC_API_KEY not set')
  }

  const pendingInsights = !process.env.ANTHROPIC_API_KEY ? [] : await sql`
    SELECT id, title, department_name, location_name, content_html
    FROM jobs
    WHERE insight_generated_at IS NULL
      AND status = 'active'
    ORDER BY first_seen_at DESC
    LIMIT 15
  ` as JobRow[]

  if (pendingInsights.length > 0) {
    const limit = await getPLimit(5)
    const results = await Promise.allSettled(
      pendingInsights.map((job) =>
        limit(async () => {
          try {
            const insight = await generateInsight(job)
            await sql`
              UPDATE jobs SET
                insight_strategic = ${insight.strategic},
                insight_financial = ${insight.financial},
                insight_ai_replacement = ${insight.aiReplacement},
                insight_generated_at = NOW(),
                insight_model = ${INSIGHT_MODEL}
              WHERE id = ${job.id}
            `
            return true
          } catch (err) {
            console.error(`Insight generation failed for job ${job.id}:`, err)
            return false
          }
        })
      )
    )
    insightsDone = results.filter(
      (r) => r.status === 'fulfilled' && r.value === true
    ).length
  }

  // 9. Regenerate global summary (always, so it reflects latest data)
  try {
    const deptRows = await sql`
      SELECT department_name AS name, COUNT(*)::int AS count
      FROM jobs WHERE status = 'active'
      GROUP BY department_name ORDER BY count DESC LIMIT 10
    ` as { name: string | null; count: number }[]

    const recentRows = await sql`
      SELECT title FROM jobs WHERE status = 'active'
      ORDER BY first_seen_at DESC LIMIT 12
    ` as { title: string }[]

    const summary = await generateGlobalSummary({
      totalActive: apiJobs.length,
      newThisWeek: newJobCount,
      closedThisWeek: closedJobCount,
      topDepartments: deptRows.map((r) => ({ name: r.name ?? 'Uncategorized', count: r.count })),
      recentTitles: recentRows.map((r) => r.title),
    })

    await sql`
      INSERT INTO global_summary (summary, model, jobs_active, jobs_new)
      VALUES (${summary}, ${INSIGHT_MODEL}, ${apiJobs.length}, ${newJobCount})
    `
  } catch (err) {
    console.error('Global summary generation failed:', err)
  }

  const durationMs = Date.now() - start

  // 10. Log sync run
  await sql`
    INSERT INTO sync_runs (jobs_fetched, new_jobs, closed_jobs, insights_done, duration_ms)
    VALUES (${apiJobs.length}, ${newJobCount}, ${closedJobCount}, ${insightsDone}, ${durationMs})
  `

  return {
    jobsFetched: apiJobs.length,
    newJobs: newJobCount,
    closedJobs: closedJobCount,
    insightsDone,
    durationMs,
  }
}

function computeDeptCounts(
  allJobs: GreenhouseJob[],
  newJobs: GreenhouseJob[],
  closedIds: number[]
): Record<string, { active: number; new: number; closed: number }> {
  const counts: Record<string, { active: number; new: number; closed: number }> = {}

  const ensure = (dept: string) => {
    if (!counts[dept]) counts[dept] = { active: 0, new: 0, closed: 0 }
  }

  for (const job of allJobs) {
    const dept = job.departments?.[0]?.name ?? 'Uncategorized'
    ensure(dept)
    counts[dept].active++
  }

  for (const job of newJobs) {
    const dept = job.departments?.[0]?.name ?? 'Uncategorized'
    ensure(dept)
    counts[dept].new++
  }

  // For closed, we don't have department info easily — skip for now
  // (closed jobs are already reflected by reduced active_count)

  return counts
}
