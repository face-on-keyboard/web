import { useQuery } from '@tanstack/react-query'
import { client } from './client'
import type { CarbonRecord } from '@/lib/carbon-records'
import type { DailyCarbonDelta } from '../dashboard/types'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const buildDailyTotals = (records: CarbonRecord[]) => {
  return records.reduce<Record<string, number>>((acc, record) => {
    acc[record.date] = (acc[record.date] ?? 0) + record.totalCO2
    return acc
  }, {})
}

export const calculateDailyDelta = (
  records: CarbonRecord[],
  totalsByDate: Record<string, number>
): DailyCarbonDelta => {
  if (records.length === 0) {
    return {
      today: 0,
      yesterday: 0,
      difference: 0,
      percentageChange: 0,
      isIncrease: false,
    }
  }

  const today = formatDate(new Date())
  const yesterday = formatDate(new Date(Date.now() - DAY_IN_MS))

  const todayTotal = totalsByDate[today] ?? 0
  const yesterdayTotal = totalsByDate[yesterday] ?? 0
  const difference = todayTotal - yesterdayTotal
  const percentageChange =
    yesterdayTotal > 0 ? (difference / yesterdayTotal) * 100 : 0

  return {
    today: Number(todayTotal.toFixed(2)),
    yesterday: Number(yesterdayTotal.toFixed(2)),
    difference: Number(difference.toFixed(2)),
    percentageChange: Number(percentageChange.toFixed(1)),
    isIncrease: difference > 0,
  }
}

export const useInvoices = () =>
  useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await client.api.invoices.$get()

      if (!response.ok) {
        throw new Error('無法獲取統一發票數據')
      }

      const records = await response.json()

      return records.data
    },
  })
