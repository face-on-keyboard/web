'use client'

import { useMemo, useState } from 'react'

import {
  buildDailyTotals,
  calculateDailyDelta,
  useInvoices,
} from '@/components/fetchers/invoices'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { EarthStatusPanel } from '../components/dashboard/EarthStatusPanel'
import { ErrorBanner } from '../components/dashboard/ErrorBanner'
import { MonthlyComparisonCard } from '../components/dashboard/MonthlyComparisonCard'
import { RecentRecords } from '../components/dashboard/RecentRecords'
import { SummaryStatCards } from '../components/dashboard/SummaryStatCards'
import { deriveCategoryStats } from '../components/dashboard/constants'
import { useMockCarbonData } from '../components/dashboard/hooks/useMockCarbonData'

export default function HomePage() {
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

  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const [testEmission, setTestEmission] = useState<number | null>(null)

  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
      } else {
        newSet.add(recordId)
      }
      return newSet
    })
  }

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

  const currentEmission = testEmission ?? dailyDelta.today

  return (
    <main className='min-h-screen bg-background-muted px-3 py-4'>
      <div className='mx-auto max-w-sm'>
        <DashboardHeader />
        <MonthlyComparisonCard stats={monthlyStats} />
        <EarthStatusPanel
          emissionValue={currentEmission}
          baseEmission={dailyDelta.today}
          testEmission={testEmission}
          onTestEmissionChange={setTestEmission}
        />
        {error && <ErrorBanner message={error.message} />}
        {/* <SummaryStatCards totalCO2={totalCO2} recordsCount={records.length} /> */}
        <CategoryBreakdown categoryStats={categoryStats} totalCO2={totalCO2 ?? 0} />
        <RecentRecords
          loading={loading}
          records={records ?? []}
          sortedRecords={sortedRecords}
          recentRecords={recentRecords}
          expandedRecords={expandedRecords}
          onToggle={toggleRecordExpansion}
          hasMoreRecords={hasMoreRecords}
        />
      </div>
    </main>
  )
}
