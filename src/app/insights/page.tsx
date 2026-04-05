import { InsightFeed } from '@/components/insights/InsightFeed'

export const revalidate = 120

export default function InsightsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="border-b pb-6">
        <h1 className="text-4xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground mt-1">
          Strategic, financial, and AI-replaceability signals generated from each new job posting
        </p>
      </div>
      <InsightFeed />
    </div>
  )
}
