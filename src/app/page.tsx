'use client'

import { useState } from 'react'

import { useHealth } from '@/components/fetchers/health'
import { useRecords } from '@/components/fetchers/records'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { EarthStatusPanel } from '../components/dashboard/EarthStatusPanel'
import { ErrorBanner } from '../components/dashboard/ErrorBanner'
import { WeeklyComparisonCard } from '../components/dashboard/WeeklyComparisonCard'
import { RecentRecords } from '../components/dashboard/RecentRecords'
import Confetti from 'react-confetti'
import { useWindowSize } from 'usehooks-ts'

export default function HomePage() {
  const {
    records,
    loading,
    error,
    dailyDelta,
    sortedRecords,
    recentRecords,
    hasMoreRecords,
    totalCO2,
    categoryStats,
    weeklyStats,
  } = useRecords()

  const { health } = useHealth()

  console.log('[HomePage] health', health)

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

  const currentEmission = testEmission ?? dailyDelta.today

  const { width, height } = useWindowSize()

  return (
    <>
      <Confetti width={width} height={height} recycle={false} />
      <main className='min-h-screen px-3 py-4'>
        <div className='mx-auto max-w-sm'>
          <DashboardHeader />
          <WeeklyComparisonCard stats={weeklyStats} />
          <EarthStatusPanel
            emissionValue={currentEmission}
            baseEmission={dailyDelta.today}
            testEmission={testEmission}
            onTestEmissionChange={setTestEmission}
          />
          {error && <ErrorBanner message={error.message} />}
          {/* <SummaryStatCards totalCO2={totalCO2} recordsCount={records.length} /> */}
          <CategoryBreakdown
            categoryStats={categoryStats}
            totalCO2={totalCO2 ?? 0}
          />
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
    </>
  )
}
