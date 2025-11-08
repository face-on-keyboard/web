'use client'

import { useEffect, useState } from 'react'

import { useHealth } from '@/components/fetchers/health'
import { useRecords } from '@/components/fetchers/records'
import { OnboardingModal } from '../components/onboarding/OnboardingModal'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { EarthStatusPanel } from '../components/dashboard/EarthStatusPanel'
import { ErrorBanner } from '../components/dashboard/ErrorBanner'
import { WeeklyComparisonCard } from '../components/dashboard/WeeklyComparisonCard'
import { RecentRecords } from '../components/dashboard/RecentRecords'

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
  const [showOnboarding, setShowOnboarding] = useState(false)

  // 檢查是否已完成 onboarding
  useEffect(() => {
    // 只在客戶端執行
    if (typeof window !== 'undefined') {
      const onboardingCompleted = localStorage.getItem('onboardingCompleted')
      if (onboardingCompleted !== 'true') {
        setShowOnboarding(true)
      }
    }
  }, [])

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

  return (
    <>
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
      <main className='min-h-screen bg-blue-50/30 px-3 py-4'>
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
