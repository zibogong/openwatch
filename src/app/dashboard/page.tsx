import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentChanges } from '@/components/dashboard/RecentChanges'
import { DepartmentSnapshot } from '@/components/dashboard/DepartmentSnapshot'
import { DashboardInsights } from '@/components/dashboard/DashboardInsights'
import { GlobalSummary } from '@/components/dashboard/GlobalSummary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const revalidate = 60

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="pt-2 space-y-3">
        <h1
          className="text-5xl font-bold tracking-tight leading-tight"
          style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
        >
          Anthropic Hiring Intel
        </h1>
        <GlobalSummary />
      </div>

      {/* Stats row */}
      <StatsCards />

      {/* Department chart */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Hiring by Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentSnapshot />
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle
            className="text-lg font-semibold"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentChanges />
        </CardContent>
      </Card>

      {/* Latest AI Insights */}
      <Card className="rounded-2xl border-border shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              Latest AI Insights
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              Strategic · Market · AI Replaceability
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DashboardInsights />
        </CardContent>
      </Card>
    </div>
  )
}
