'use client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { SnapshotSeries } from '@/types/db'

interface Props {
  series: SnapshotSeries[]
}

const COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16',
]

export function TrendAreaChart({ series }: Props) {
  if (!series?.length) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No trend data yet</div>
  }

  // Pivot: group by snapshot_at, collect department counts
  const deptSet = new Set<string>()
  const byTime = new Map<string, Record<string, number>>()

  for (const row of series) {
    const key = new Date(row.snapshot_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    deptSet.add(row.department_name)
    if (!byTime.has(key)) byTime.set(key, {})
    byTime.get(key)![row.department_name] = row.active_count
  }

  const departments = [...deptSet].slice(0, 8) // top 8 for readability
  const chartData = [...byTime.entries()].map(([date, counts]) => ({
    date,
    ...counts,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={32} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {departments.map((dept, i) => (
          <Area
            key={dept}
            type="monotone"
            dataKey={dept}
            stackId="1"
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
