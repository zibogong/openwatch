'use client'
import { useStats } from '@/hooks/useStats'
import { formatRelative } from '@/lib/utils'
import type { StatsResponse } from '@/types/db'

interface Props {
  fallbackData?: StatsResponse
}

export function StatsCards({ fallbackData }: Props) {
  const { data } = useStats(fallbackData)

  return (
    <div className="flex items-center gap-10">
      <StatNum label="Active Jobs"       value={data?.total_active}       accent />
      <div className="w-px h-10 bg-border" />
      <StatNum label="New This Week"     value={data?.new_this_week} />
      <div className="w-px h-10 bg-border" />
      <StatNum label="Closed This Week"  value={data?.closed_this_week} />
      <div className="w-px h-10 bg-border" />
      <StatNum label="Departments"       value={data?.by_department?.length} />
      {data?.last_sync && (
        <p className="ml-auto text-xs text-muted-foreground">
          Synced {formatRelative(data.last_sync)}
        </p>
      )}
    </div>
  )
}

function StatNum({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string | undefined
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
        {label}
      </span>
      <span
        className={`text-5xl font-bold leading-none tracking-tight ${
          accent ? 'text-foreground' : 'text-foreground/80'
        }`}
        style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
      >
        {value ?? '—'}
      </span>
    </div>
  )
}
