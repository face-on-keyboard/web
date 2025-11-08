import { useMemo } from 'react'
import { buildDailyTotals, calculateDailyDelta, useInvoices } from './invoices'
import { deriveCategoryStats } from '../dashboard/constants'

export function useRecords() {
  const { data: records, isLoading: loading, error } = useInvoices()

  const dailyTotals = useMemo(() => {
    if (!records) {
      return {}
    }

    return buildDailyTotals(records)
  }, [records])
  const dailyDelta = useMemo(() => {
    if (!records) {
      return {
        today: 0,
        yesterday: 0,
        difference: 0,
        percentageChange: 0,
        isIncrease: false,
      }
    }
    return calculateDailyDelta(records, dailyTotals)
  }, [records, dailyTotals])

  const sortedRecords = useMemo(() => {
    if (!records) {
      return []
    }

    return [...records].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [records])

  const recentRecords = sortedRecords.slice(0, 3)
  const hasMoreRecords = sortedRecords.length > 3

  const totalCO2 = records?.reduce((sum, record) => sum + record.totalCO2, 0)
  const categoryStats = useMemo(
    () => deriveCategoryStats(records ?? []),
    [records]
  )

  const monthlyStats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)

    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1)
    const lastMonthEnd = new Date(currentYear, currentMonth, 0)

    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const currentMonthStartStr = formatDate(currentMonthStart)
    const currentMonthEndStr = formatDate(currentMonthEnd)
    const lastMonthStartStr = formatDate(lastMonthStart)
    const lastMonthEndStr = formatDate(lastMonthEnd)

    const currentMonthCO2 = records
      ?.filter((record) => {
        const recordDate = record.date
        return (
          recordDate >= currentMonthStartStr && recordDate <= currentMonthEndStr
        )
      })
      .reduce((sum, record) => sum + record.totalCO2, 0)

    const lastMonthCO2 = records
      ?.filter((record) => {
        const recordDate = record.date
        return recordDate >= lastMonthStartStr && recordDate <= lastMonthEndStr
      })
      .reduce((sum, record) => sum + record.totalCO2, 0)

    const difference = (currentMonthCO2 ?? 0) - (lastMonthCO2 ?? 0)
    const percentage =
      (lastMonthCO2 ?? 0) > 0 ? (difference / (lastMonthCO2 ?? 1)) * 100 : 0

    return {
      currentMonth: currentMonthCO2 ?? 0,
      lastMonth: lastMonthCO2 ?? 0,
      difference,
      percentage,
      isIncrease: difference > 0,
    }
  }, [records])

  const weeklyCO2 = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = 星期日, 1 = 星期一, ...
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek) // 設定為本週第一天（星期日）
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // 本週最後一天
    endOfWeek.setHours(23, 59, 59, 999)

    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const startStr = formatDate(startOfWeek)
    const endStr = formatDate(endOfWeek)

    return records
      ?.filter((record) => {
        const recordDate = record.date
        return recordDate >= startStr && recordDate <= endStr
      })
      .reduce((sum, record) => sum + record.totalCO2, 0)
  }, [records])

  return {
    records,
    loading,
    error,
    dailyTotals,
    dailyDelta,
    sortedRecords,
    recentRecords,
    hasMoreRecords,
    totalCO2,
    categoryStats,
    monthlyStats,
    weeklyCO2,
  }
}
