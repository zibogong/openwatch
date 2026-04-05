'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DEPARTMENTS = [
  'All',
  'Engineering',
  'Research',
  'Product',
  'Design',
  'Sales',
  'Marketing',
  'Finance',
  'Legal',
  'Operations',
  'People',
  'Recruiting',
  'Policy',
  'Uncategorized',
]

export function JobFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const status = params.get('status') ?? 'active'
  const department = params.get('department') ?? 'All'
  function update(key: string, value: string | null) {
    if (!value) return
    const p = new URLSearchParams(params.toString())
    if (value === 'All' || value === 'all') {
      p.delete(key)
    } else {
      p.set(key, value)
    }
    p.delete('page')
    router.push(`/jobs?${p.toString()}`)
  }

  return (
    <div className="flex gap-3 flex-wrap">
      <Select value={status} onValueChange={(v) => update('status', v)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <Select value={department} onValueChange={(v) => update('department', v)}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          {DEPARTMENTS.map((d) => (
            <SelectItem key={d} value={d}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
