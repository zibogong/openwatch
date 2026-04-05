'use client'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { StatsResponse } from '@/types/db'

interface Props {
  stats: StatsResponse
}

export function ActiveClosedPieChart({ stats }: Props) {
  const data = [
    { name: 'Active', value: stats.total_active },
    { name: 'Closed (7d)', value: stats.closed_this_week },
  ].filter((d) => d.value > 0)

  if (!data.length) {
    return <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
          labelLine={false}
        >
          <Cell fill="#3b82f6" />
          <Cell fill="#ef4444" />
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
