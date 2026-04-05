'use client'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { SnapshotSeries } from '@/types/db'

interface Props {
  series: SnapshotSeries[]
}

export function NewJobsTimelineChart({ series }: Props) {
  if (!series?.length) {
    return <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
  }

  // Aggregate new_count across all departments per day
  const byDay = new Map<string, number>()
  for (const row of series) {
    const day = new Date(row.snapshot_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    })
    byDay.set(day, (byDay.get(day) ?? 0) + row.new_count)
  }

  const chartData = [...byDay.entries()].map(([date, count]) => ({ date, count }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={32} allowDecimals={false} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="New Jobs"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
