import { useEffect, useMemo, useState } from 'react'

import { CarbonRecord, DailyCarbonDelta, MockCarbonData } from '../types'

const DAY_IN_MS = 24 * 60 * 60 * 1000

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createMockRecords = (): CarbonRecord[] => {
  const now = new Date()

  const today = formatDate(now)
  const yesterday = formatDate(new Date(now.getTime() - DAY_IN_MS))
  const twoDaysAgo = formatDate(new Date(now.getTime() - DAY_IN_MS * 2))
  const threeDaysAgo = formatDate(new Date(now.getTime() - DAY_IN_MS * 3))
  const fourDaysAgo = formatDate(new Date(now.getTime() - DAY_IN_MS * 4))

  return [
    {
      id: 'mock-1',
      invoiceNumber: 'AA12345678',
      date: today,
      storeName: '7-ELEVEN 便利商店',
      totalAmount: 235,
      category: 'food',
      totalCO2: 12.6,
      items: [
        { name: '咖啡', amount: 45, quantity: 1, category: 'food', co2Amount: 3.6 },
        { name: '飯糰', amount: 35, quantity: 1, category: 'food', co2Amount: 2.8 },
        { name: '沙拉', amount: 80, quantity: 1, category: 'food', co2Amount: 4.8 },
        { name: '環保袋', amount: 20, quantity: 1, category: 'shopping', co2Amount: 1.4 },
      ],
    },
    {
      id: 'mock-2',
      invoiceNumber: 'BB23456789',
      date: today,
      storeName: '全聯福利中心',
      totalAmount: 680,
      category: 'shopping',
      totalCO2: 48,
      items: [
        { name: '生活用品', amount: 350, quantity: 1, category: 'shopping', co2Amount: 28 },
        { name: '蔬果', amount: 150, quantity: 1, category: 'food', co2Amount: 9.6 },
        { name: '保養品', amount: 180, quantity: 1, category: 'other', co2Amount: 10.4 },
      ],
    },
    {
      id: 'mock-3',
      invoiceNumber: 'CC34567890',
      date: yesterday,
      storeName: '家樂福',
      totalAmount: 520,
      category: 'shopping',
      totalCO2: 32.9,
      items: [
        { name: '清潔用品', amount: 280, quantity: 1, category: 'shopping', co2Amount: 18.2 },
        { name: '零食', amount: 120, quantity: 1, category: 'food', co2Amount: 7.2 },
        { name: '飲料', amount: 120, quantity: 1, category: 'food', co2Amount: 7.5 },
      ],
    },
    {
      id: 'mock-4',
      invoiceNumber: 'DD45678901',
      date: twoDaysAgo,
      storeName: '誠品書店',
      totalAmount: 530,
      category: 'other',
      totalCO2: 20.5,
      items: [
        { name: '書籍', amount: 380, quantity: 1, category: 'other', co2Amount: 14.4 },
        { name: '文具用品', amount: 150, quantity: 1, category: 'other', co2Amount: 6.1 },
      ],
    },
    {
      id: 'mock-5',
      invoiceNumber: 'EE56789012',
      date: threeDaysAgo,
      storeName: '康是美藥妝店',
      totalAmount: 730,
      category: 'other',
      totalCO2: 34.8,
      items: [
        { name: '醫療用品', amount: 280, quantity: 1, category: 'other', co2Amount: 12.4 },
        { name: '保養品', amount: 450, quantity: 1, category: 'other', co2Amount: 22.4 },
      ],
    },
    {
      id: 'mock-6',
      invoiceNumber: 'FF67890123',
      date: fourDaysAgo,
      storeName: '地方市集',
      totalAmount: 420,
      category: 'food',
      totalCO2: 21.6,
      items: [
        { name: '生鮮蔬菜', amount: 180, quantity: 1, category: 'food', co2Amount: 9.2 },
        { name: '水果', amount: 140, quantity: 1, category: 'food', co2Amount: 6.8 },
        { name: '烘焙點心', amount: 100, quantity: 1, category: 'food', co2Amount: 5.6 },
      ],
    },
  ]
}

const buildDailyTotals = (records: CarbonRecord[]) => {
  return records.reduce<Record<string, number>>((acc, record) => {
    acc[record.date] = (acc[record.date] ?? 0) + record.totalCO2
    return acc
  }, {})
}

const calculateDailyDelta = (
  records: CarbonRecord[],
  totalsByDate: Record<string, number>,
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

export const useMockCarbonData = (): MockCarbonData => {
  const [records, setRecords] = useState<CarbonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const mockRecords = createMockRecords()
        setRecords(mockRecords)
        setLoading(false)
      } catch (err) {
        console.error('Failed to prepare mock carbon data', err)
        setError('無法準備模擬數據')
        setLoading(false)
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [])

  const dailyTotals = useMemo(() => buildDailyTotals(records), [records])
  const dailyDelta = useMemo(
    () => calculateDailyDelta(records, dailyTotals),
    [records, dailyTotals],
  )
  return {
    records,
    loading,
    error,
    dailyDelta,
  }
}


