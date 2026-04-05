export interface JobRow {
  id: number
  title: string
  department_name: string | null
  location_name: string | null
  absolute_url: string | null
  content_html: string | null
  status: 'active' | 'closed'
  first_seen_at: string
  last_seen_at: string
  closed_at: string | null
  greenhouse_updated_at: string | null
  insight_strategic: string | null
  insight_financial: string | null
  insight_ai_replacement: string | null
  insight_generated_at: string | null
  insight_model: string | null
}

export interface DepartmentSnapshot {
  id: number
  snapshot_at: string
  department_name: string
  active_count: number
  new_count: number
  closed_count: number
}

export interface SyncRun {
  id: number
  ran_at: string
  jobs_fetched: number | null
  new_jobs: number | null
  closed_jobs: number | null
  insights_done: number | null
  error_message: string | null
  duration_ms: number | null
}

export interface DepartmentStat {
  department: string
  count: number
}

export interface StatsResponse {
  total_active: number
  new_this_week: number
  closed_this_week: number
  by_department: DepartmentStat[]
  last_sync: string | null
}

export interface SnapshotSeries {
  snapshot_at: string
  department_name: string
  active_count: number
  new_count: number
  closed_count: number
}

export interface JobsResponse {
  jobs: JobRow[]
  total: number
  page: number
}

export interface InsightsResponse {
  jobs: JobRow[]
  total: number
  page: number
}
