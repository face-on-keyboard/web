import { useMemo } from 'react'
import { buildDailyTotals, calculateDailyDelta, useInvoices } from './invoices'
import { deriveCategoryStats } from '../dashboard/constants'

export const CARBON_CATEGORIES = [
  {
    value: 'food',
    label: '食物',
    icon: '/icons/eat.svg',
    iconType: 'image',
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'shopping',
    label: '購物',
    icon: '/icons/shopping.svg',
    iconType: 'image',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'transport',
    label: '交通',
    icon: '/icons/transport.svg',
    iconType: 'image',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'other',
    label: '其他',
    icon: '/icons/other.svg',
    iconType: 'image',
    color: 'bg-grey-100 text-grey-700',
  },
]

const getCategoryLabel = (categoryValue: string) => {
  const category = CARBON_CATEGORIES.find((c) => c.value === categoryValue)
  return category?.label || '其他'
}

export function useRecords(options?: {
  sortBy?: 'date' | 'category'
  sortOrder?: 'asc' | 'desc'
}) {
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
    if (!records) return []

    const sorted = [...records]
    sorted.sort((a, b) => {
      let comparison = 0
      if (!options?.sortBy || options.sortBy === 'date') {
        // 按日期排序
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (options.sortBy === 'category') {
        // 按類型（類別）排序
        const categoryA = getCategoryLabel(a.category)
        const categoryB = getCategoryLabel(b.category)
        comparison = categoryA.localeCompare(categoryB, 'zh-TW')
        // 如果類型相同，再按日期排序
        if (comparison === 0) {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        }
      }
      return !options?.sortOrder || options.sortOrder === 'asc'
        ? comparison
        : -comparison
    })
    return sorted
  }, [records, options])

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
