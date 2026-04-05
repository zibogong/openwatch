export interface GreenhouseDepartment {
  id: number
  name: string
  parent_id: number | null
  child_ids: number[]
}

export interface GreenhouseOffice {
  id: number
  name: string
  location: string | null
  parent_id: number | null
  child_ids: number[]
}

export interface GreenhouseLocation {
  name: string
}

export interface GreenhouseJob {
  id: number
  internal_job_id: number
  title: string
  updated_at: string
  requisition_id: string | null
  location: GreenhouseLocation
  departments: GreenhouseDepartment[]
  offices: GreenhouseOffice[]
  absolute_url: string
  content?: string // only present when ?content=true
}

export interface GreenhouseJobsResponse {
  jobs: GreenhouseJob[]
  meta: {
    total: number
  }
}
