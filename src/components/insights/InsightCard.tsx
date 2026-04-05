import type { JobRow } from '@/types/db'

interface Props {
  job: JobRow
  compact?: boolean
}

const panels = [
  {
    key: 'insight_strategic' as const,
    label: 'Strategic Signal',
    sublabel: 'Company direction',
    dot: '#3b82f6',
  },
  {
    key: 'insight_financial' as const,
    label: 'Financial Signal',
    sublabel: 'Market impact',
    dot: '#f59e0b',
  },
  {
    key: 'insight_ai_replacement' as const,
    label: 'AI Replaceability',
    sublabel: 'Human edge',
    dot: '#8b5cf6',
  },
]

export function InsightCard({ job, compact }: Props) {
  if (!job.insight_strategic) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
        Insights are being generated — check back shortly.
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {panels.map((p) => {
        const text = job[p.key]
        if (!text) return null
        return (
          <div key={p.key} className={`flex gap-4 ${compact ? 'py-3' : 'py-4'}`}>
            {/* Dot + label column */}
            <div className="w-36 shrink-0 pt-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.dot }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: p.dot }}
                >
                  {p.label}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 pl-3">{p.sublabel}</p>
            </div>
            {/* Text */}
            <p className="text-sm leading-relaxed text-foreground/80 flex-1">{text}</p>
          </div>
        )
      })}
    </div>
  )
}
