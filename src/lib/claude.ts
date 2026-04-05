import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-sonnet-4-6'

export interface JobInsight {
  strategic: string
  financial: string
  aiReplacement: string
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export async function generateInsight(job: {
  id: number
  title: string
  department_name: string | null
  location_name: string | null
  content_html: string | null
}): Promise<JobInsight> {
  const rawContent = job.content_html ? stripHtml(job.content_html) : ''
  const content = rawContent.slice(0, 3000)

  const prompt = `You are a strategic analyst tracking Anthropic's hiring patterns to understand company direction and market implications.

Analyze this Anthropic job posting:

Title: ${job.title}
Department: ${job.department_name ?? 'Unknown'}
Location: ${job.location_name ?? 'Unknown'}

Job Description:
${content || '(No description available)'}

Respond with ONLY a valid JSON object (no markdown, no code fences) with exactly these three keys:

{
  "strategic": "2-3 sentences. What does this hire reveal about Anthropic's strategic direction, new product areas, or organizational priorities? Look for clues in required skills, team structure, and focus areas.",
  "financial": "2-3 sentences. Which specific industries, sectors, or publicly-traded companies could face disruption if Anthropic scales this capability? Be concrete — name sectors (e.g., legal research software, medical imaging AI, enterprise search). Who stands to lose market share?",
  "aiReplacement": "2-3 sentences. Rate AI-replaceability of this role as Low, Medium, or High. Explain why Anthropic is still hiring humans for this — is it because AI genuinely cannot do it yet, or because human oversight/trust/creativity is specifically required here?"
}`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Strip markdown fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  const parsed = JSON.parse(cleaned)

  return {
    strategic: parsed.strategic ?? '',
    financial: parsed.financial ?? '',
    aiReplacement: parsed.aiReplacement ?? '',
  }
}

export interface SummaryInput {
  totalActive: number
  newThisWeek: number
  closedThisWeek: number
  topDepartments: { name: string; count: number }[]
  recentTitles: string[]
}

export async function generateGlobalSummary(input: SummaryInput): Promise<string> {
  const deptList = input.topDepartments
    .slice(0, 8)
    .map((d) => `${d.name} (${d.count})`)
    .join(', ')

  const titleList = input.recentTitles.slice(0, 10).join(', ')

  const prompt = `You are a strategic analyst monitoring Anthropic's hiring activity.

Current snapshot:
- Total active jobs: ${input.totalActive}
- New this week: ${input.newThisWeek}
- Closed this week: ${input.closedThisWeek}
- Top hiring departments: ${deptList}
- Sample of recent job titles: ${titleList}

Write 1-3 sentences summarizing what Anthropic's current hiring pattern signals about the company's strategic priorities, growth areas, or notable shifts. Be concrete and insightful — this appears at the top of a monitoring dashboard. No hedging, no fluff. Plain text only, no markdown.`

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
  return text
}

export { MODEL as INSIGHT_MODEL }
