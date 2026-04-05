'use client'
import { useStats } from '@/hooks/useStats'
import { DepartmentBarChart } from '@/components/charts/DepartmentBarChart'
import type { StatsResponse } from '@/types/db'

interface Props {
  fallbackData?: StatsResponse
}

export function DepartmentSnapshot({ fallbackData }: Props) {
  const { data } = useStats(fallbackData)
  return <DepartmentBarChart data={data?.by_department ?? []} />
}
