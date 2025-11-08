'use client'

import { useState } from 'react'

import { useHealth } from '@/components/fetchers/health'
import { useRecords } from '@/components/fetchers/records'
import { CategoryBreakdown } from '../components/dashboard/CategoryBreakdown'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { EarthStatusPanel } from '../components/dashboard/EarthStatusPanel'
import { ErrorBanner } from '../components/dashboard/ErrorBanner'
import { MonthlyComparisonCard } from '../components/dashboard/MonthlyComparisonCard'
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
		monthlyStats,
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
	)
}
