'use client'

import { useState, useEffect, useMemo } from 'react'

interface CarbonRecordItem {
  name: string
  amount: number
  quantity: number
  category: string
  co2Amount: number
}

interface CarbonRecord {
  id: string
  invoiceNumber: string
  date: string
  storeName: string
  totalAmount: number
  category: string
  totalCO2: number
  items: CarbonRecordItem[]
}

const CARBON_CATEGORIES = [
  { 
    value: 'food', 
    label: '食物', 
    icon: '/icons/eat.svg',
    iconType: 'image',
    color: 'bg-green-100 text-green-700' 
  },
  { 
    value: 'shopping', 
    label: '購物', 
    icon: '/icons/shopping.svg',
    iconType: 'image',
    color: 'bg-purple-100 text-purple-700' 
  },
  { 
    value: 'transport', 
    label: '交通', 
    icon: '/icons/transport.svg',
    iconType: 'image',
    color: 'bg-blue-100 text-blue-700' 
  },
  { 
    value: 'other', 
    label: '其他', 
    icon: '/icons/other.svg', 
    iconType: 'image',
    color: 'bg-grey-100 text-grey-700' 
  },
]

export default function HomePage() {
  const [records, setRecords] = useState<CarbonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/invoices')
      
      if (!response.ok) {
        throw new Error('無法獲取統一發票數據')
      }
      
      const data = await response.json()
      setRecords(data.records || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])


  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
      } else {
        newSet.add(recordId)
      }
      return newSet
    })
  }

  // 按日期排序，最新的在前
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [records])

  // 只顯示最近三筆
  const recentRecords = sortedRecords.slice(0, 3)
  const hasMoreRecords = sortedRecords.length > 3

  const totalCO2 = records.reduce((sum, record) => sum + record.totalCO2, 0)
  const categoryStats = records.reduce((acc, record) => {
    const category = CARBON_CATEGORIES.find(c => c.value === record.category)?.label || record.category
    acc[category] = (acc[category] || 0) + record.totalCO2
    return acc
  }, {} as Record<string, number>)

  // 計算本月和上個月的碳排放
  const monthlyStats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // 本月第一天和最後一天
    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0)
    
    // 上個月第一天和最後一天
    const lastMonthStart = new Date(currentYear, currentMonth - 1, 1)
    const lastMonthEnd = new Date(currentYear, currentMonth, 0)
    
    // 格式化日期為 YYYY-MM-DD
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
    
    // 計算本月的碳排放
    const currentMonthCO2 = records
      .filter(record => {
        const recordDate = record.date
        return recordDate >= currentMonthStartStr && recordDate <= currentMonthEndStr
      })
      .reduce((sum, record) => sum + record.totalCO2, 0)
    
    // 計算上個月的碳排放
    const lastMonthCO2 = records
      .filter(record => {
        const recordDate = record.date
        return recordDate >= lastMonthStartStr && recordDate <= lastMonthEndStr
      })
      .reduce((sum, record) => sum + record.totalCO2, 0)
    
    // 計算差異
    const difference = currentMonthCO2 - lastMonthCO2
    const percentage = lastMonthCO2 > 0 ? (difference / lastMonthCO2) * 100 : 0
    
    return {
      currentMonth: currentMonthCO2,
      lastMonth: lastMonthCO2,
      difference,
      percentage,
      isIncrease: difference > 0,
    }
  }, [records])

  // 這個函數已棄用，請使用 getCategoryIconElement
  const getCategoryIcon = (categoryValue: string) => {
    const category = CARBON_CATEGORIES.find(c => c.value === categoryValue)
    return category?.icon || '📝'
  }
  
  const getCategoryIconElement = (categoryValue: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const category = CARBON_CATEGORIES.find(c => c.value === categoryValue)
    if (!category) return <span className='text-lg'>📝</span>
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }
    
    // 如果使用圖片圖標
    if (category.iconType === 'image') {
      return (
        <img 
          src={category.icon} 
          alt={category.label}
          className={`${sizeClasses[size]} object-contain`}
        />
      )
    }
    
    // 使用 emoji
    const emojiSizes = {
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
    }
    return <span className={emojiSizes[size]}>{category.icon}</span>
  }

  const getCategoryLabel = (categoryValue: string) => {
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue
  }

  const getCategoryColor = (categoryValue: string) => {
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.color || 'bg-grey-100 text-grey-700'
  }


  return (
    <main className='min-h-screen bg-background-muted py-4 px-3'>
      <div className='mx-auto max-w-sm'>
        {/* 標題區域 */}
        <div className='mb-4'>
          <h1 className='mb-1 text-2xl font-semibold text-foreground-primary'>碳排 Dashboard</h1>
        </div>

        {/* 本月碳排對比區塊 */}
        <div className='mb-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white shadow-lg'>
          <div className='mb-3 flex items-center justify-between'>
            <div>
              <div className='mb-1 text-xs opacity-90'>本月碳排放</div>
              <div className='text-2xl font-bold'>
                {monthlyStats.currentMonth.toFixed(2)} kg CO₂
              </div>
            </div>
            <div className='text-right'>
              {monthlyStats.lastMonth > 0 ? (
                <>
                  <div className='mb-1 text-xs opacity-90'>
                    較上個月
                  </div>
                  <div className='flex items-center gap-1 text-lg font-bold'>
                    {monthlyStats.isIncrease ? (
                      <>
                        <span>📈</span>
                        <span className='text-red-200'>
                          +{monthlyStats.difference.toFixed(2)} kg
                        </span>
                      </>
                    ) : (
                      <>
                        <span>📉</span>
                        <span className='text-green-200'>
                          {monthlyStats.difference.toFixed(2)} kg
                        </span>
                      </>
                    )}
                  </div>
                  <div className='mt-1 text-xs opacity-75'>
                    ({monthlyStats.isIncrease ? '+' : ''}{monthlyStats.percentage.toFixed(1)}%)
                  </div>
                </>
              ) : (
                <div className='text-xs opacity-75'>
                  無上月數據
                </div>
              )}
            </div>
          </div>
          {monthlyStats.lastMonth > 0 && (
            <div className='mt-3 rounded-lg bg-white/20 p-2 text-xs backdrop-blur-sm'>
              <div className='flex items-center justify-between'>
                <span>上月碳排放：{monthlyStats.lastMonth.toFixed(2)} kg CO₂</span>
                <span className={monthlyStats.isIncrease ? 'text-red-200' : 'text-green-200'}>
                  {monthlyStats.isIncrease ? '增加' : '減少'} {Math.abs(monthlyStats.percentage).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className='mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600'>
            ⚠️ {error}
          </div>
        )}

        {/* 統計卡片 */}
        <div className='mb-4 grid grid-cols-2 gap-3'>
          <div className='rounded-lg bg-white p-4 shadow-sm'>
            <div className='mb-1 text-xs text-foreground-muted'>總碳排放量</div>
            <div className='text-xl font-semibold text-primary-600'>{totalCO2.toFixed(2)}</div>
            <div className='text-xs text-foreground-muted'>kg CO₂</div>
          </div>
          <div className='rounded-lg bg-white p-4 shadow-sm'>
            <div className='mb-1 text-xs text-foreground-muted'>記錄數量</div>
            <div className='text-xl font-semibold text-primary-600'>{records.length}</div>
            <div className='text-xs text-foreground-muted'>筆記錄</div>
          </div>
        </div>

        {/* 類別統計 */}
        {Object.keys(categoryStats).length > 0 && (
          <div className='mb-4 rounded-lg bg-white p-4 shadow-sm'>
            <h2 className='mb-3 text-lg font-semibold text-foreground-primary'>碳排組成</h2>
            <div className='space-y-2.5'>
              {Object.entries(categoryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const categoryInfo = CARBON_CATEGORIES.find(c => c.label === category)
                  return (
                    <div key={category} className='flex flex-col gap-2'>
                      <div className='flex items-center gap-2'>
                        {getCategoryIconElement(
                          CARBON_CATEGORIES.find(c => c.label === category)?.value || 'other',
                          'md'
                        )}
                        <span className='text-sm text-foreground-primary'>{category}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 flex-1 rounded-full bg-grey-200'>
                          <div
                            className='h-2 rounded-full bg-primary-500'
                            style={{
                              width: `${totalCO2 > 0 ? (amount / totalCO2) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className='text-xs font-semibold text-foreground-primary'>
                          {amount.toFixed(2)} kg
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}

        {/* 記錄列表 */}
        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-foreground-primary'>最近紀錄
            </h2>
            {loading && (
              <div className='text-xs text-foreground-muted'>載入中...</div>
            )}
          </div>
          {loading && records.length === 0 ? (
            <div className='py-8 text-center'>
              <div className='mb-3 text-3xl animate-pulse'>📄</div>
              <p className='text-sm text-foreground-muted'>正在載入統一發票數據...</p>
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className='py-8 text-center'>
              <div className='mb-3 text-3xl'>📄</div>
              <p className='text-sm text-foreground-muted'>尚無發票記錄</p>
            </div>
          ) : (
            <>
              <div className='space-y-2.5'>
                {recentRecords.map((record) => {
                const isExpanded = expandedRecords.has(record.id)
                return (
                  <div
                    key={record.id}
                    className='rounded-lg border border-grey-200 bg-white transition-colors hover:bg-grey-50'
                  >
                    {/* 主要記錄資訊 */}
                    <div
                      className='flex flex-col gap-3 p-3 cursor-pointer'
                      onClick={() => toggleRecordExpansion(record.id)}
                    >
                      <div className='flex items-start gap-3'>
                        <div>
                          {getCategoryIconElement(record.category, 'lg')}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
                            <span className='text-sm font-semibold text-foreground-primary break-words'>
                              {record.storeName}
                            </span>
                            <span className={`rounded-full px-1.5 py-0.5 text-xs ${getCategoryColor(record.category)}`}>
                              {getCategoryLabel(record.category)}
                            </span>
                          </div>
                          <div className='flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted'>
                            <span className='font-semibold text-foreground-primary'>
                              NT$ {record.totalAmount.toLocaleString()}
                            </span>
                            <span>·</span>
                            <span className='font-mono text-xs'>發票: {record.invoiceNumber}</span>
                            <span>·</span>
                            <span>{new Date(record.date).toLocaleDateString('zh-TW')}</span>
                            <span>·</span>
                            <span>{record.items.length} 項商品</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='text-base font-semibold text-primary-600'>
                          {record.totalCO2.toFixed(2)} kg
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className='text-xs text-foreground-muted'>CO₂</div>
                          <span className={`text-foreground-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 展開的明細 */}
                    {isExpanded && (
                      <div className='border-t border-grey-200 bg-grey-50 p-3'>
                        <div className='mb-2 text-xs font-semibold text-foreground-primary'>
                          商品明細
                        </div>
                        <div className='space-y-2'>
                          {record.items.map((item, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm'
                            >
                              <div className='flex-1 min-w-0'>
                                <div className='mb-1'>
                                  <span className='text-xs font-semibold text-foreground-primary'>
                                    {item.name}
                                  </span>
                                </div>
                                <div className='flex items-center gap-2 text-xs text-foreground-muted'>
                                  <span>數量: {item.quantity}</span>
                                  <span>·</span>
                                  <span>NT$ {item.amount.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className='ml-3 text-right'>
                                <div className='text-xs font-semibold text-primary-600'>
                                  {item.co2Amount.toFixed(2)} kg
                                </div>
                                <div className='text-xs text-foreground-muted'>CO₂</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className='mt-3 flex items-center justify-between rounded-lg bg-primary-50 p-2 text-xs font-semibold text-primary-700'>
                          <span>總計</span>
                          <span>{record.totalCO2.toFixed(2)} kg CO₂</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              </div>
              {hasMoreRecords && (
                <div className='mt-4 text-center'>
                  <a
                    href='/records'
                    className='inline-block rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700'
                  >
                    查看全部記錄 ({sortedRecords.length} 筆)
                  </a>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </main>
  )
}
