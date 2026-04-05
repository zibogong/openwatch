'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { DepartmentStat } from '@/types/db'

const COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
]

interface Props {
  data: DepartmentStat[]
  height?: number
}

export function DepartmentBarChart({ data, height = 300 }: Props) {
  if (!data?.length) {
    return <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No data</div>
  }

  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 12)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={sorted} margin={{ top: 4, right: 8, bottom: 60, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="department"
          tick={{ fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} width={32} />
        <Tooltip
          formatter={(v) => [`${v} jobs`, 'Count']}
          contentStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
