import type { GreenhouseJob, GreenhouseJobsResponse } from '@/types/greenhouse'

const BASE_URL = 'https://boards-api.greenhouse.io/v1/boards/anthropic'

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 0 },
        headers: { 'User-Agent': 'OpenWatch/1.0 (job monitoring app)' },
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      return res
    } catch (err) {
      lastError = err as Error
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)))
      }
    }
  }
  throw lastError
}

export async function fetchAllJobs(): Promise<GreenhouseJob[]> {
  const res = await fetchWithRetry(`${BASE_URL}/jobs?content=true`)
  const data: GreenhouseJobsResponse = await res.json()
  return data.jobs ?? []
}

export async function fetchJob(id: number): Promise<GreenhouseJob> {
  const res = await fetchWithRetry(`${BASE_URL}/jobs/${id}?content=true`)
  return res.json()
}
