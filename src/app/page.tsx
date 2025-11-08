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
    value: 'transport', 
    label: '交通運輸', 
    icon: '/icons/transport.svg',
    iconType: 'image',
    color: 'bg-blue-100 text-blue-700' 
  },
  { 
    value: 'energy', 
    label: '能源使用', 
    icon: '⚡', 
    iconType: 'emoji',
    color: 'bg-yellow-100 text-yellow-700' 
  },
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
    value: 'other', 
    label: '其他', 
    icon: '📝', 
    iconType: 'emoji',
    color: 'bg-grey-100 text-grey-700' 
  },
]

type FilterType = 'all' | 'product' | 'service'

export default function HomePage() {
  const [records, setRecords] = useState<CarbonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [mobileView, setMobileView] = useState(false)
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

  // 過濾和搜索記錄
  const filteredRecords = useMemo(() => {
    let filtered = records

    // 搜索過濾（商品/服務名稱、商店名稱、發票號碼）
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(record => 
        record.storeName.toLowerCase().includes(query) ||
        record.invoiceNumber.toLowerCase().includes(query) ||
        record.items.some(item => item.name.toLowerCase().includes(query))
      )
    }

    // 類別過濾
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(record => record.category === selectedCategory)
    }

    // 日期範圍過濾
    if (dateRange.start) {
      filtered = filtered.filter(record => record.date >= dateRange.start)
    }
    if (dateRange.end) {
      filtered = filtered.filter(record => record.date <= dateRange.end)
    }

    // 商品/服務過濾（根據商品名稱判斷）
    if (filterType === 'product') {
      filtered = filtered.filter(record => {
        return record.items.some(item => {
          const name = item.name.toLowerCase()
          return !name.includes('服務') && !name.includes('費') && 
                 !name.includes('運費') && !name.includes('手續費')
        })
      })
    } else if (filterType === 'service') {
      filtered = filtered.filter(record => {
        return record.items.some(item => {
          const name = item.name.toLowerCase()
          return name.includes('服務') || name.includes('費') || 
                 name.includes('運費') || name.includes('手續費')
        })
      })
    }

    return filtered
  }, [records, searchQuery, selectedCategory, filterType, dateRange])

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

  const totalCO2 = filteredRecords.reduce((sum, record) => sum + record.totalCO2, 0)
  const categoryStats = filteredRecords.reduce((acc, record) => {
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
      md: 'h-5 w-5 sm:h-6 sm:w-6',
      lg: 'h-6 w-6 sm:h-8 sm:w-8',
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
      md: 'text-lg sm:text-xl',
      lg: 'text-xl sm:text-2xl',
    }
    return <span className={emojiSizes[size]}>{category.icon}</span>
  }

  const getCategoryLabel = (categoryValue: string) => {
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue
  }

  const getCategoryColor = (categoryValue: string) => {
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.color || 'bg-grey-100 text-grey-700'
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setFilterType('all')
    setDateRange({ start: '', end: '' })
  }

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || filterType !== 'all' || dateRange.start || dateRange.end

  return (
    <main className='min-h-screen bg-background-muted py-4 px-3 sm:py-6 sm:px-4 md:py-8'>
      {/* 手機布局切換按鈕（僅在桌面顯示） */}
      <div className='fixed right-4 top-4 z-50 hidden md:block'>
        <button
          onClick={() => setMobileView(!mobileView)}
          className='rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary-700'
          title={mobileView ? '切換到桌面布局' : '切換到手機布局'}
        >
          {mobileView ? '🖥️ 桌面' : '📱 手機'}
        </button>
      </div>

      <div className={`mx-auto ${mobileView ? 'max-w-sm' : 'max-w-7xl'}`}>
        {/* 標題區域 */}
        <div className={`mb-4 ${mobileView ? '' : 'sm:mb-6 md:mb-8'}`}>
          <h1 className={`mb-1 text-2xl font-semibold text-foreground-primary ${mobileView ? '' : 'sm:text-3xl sm:mb-2 md:text-h1'}`}>碳排 Dashboard</h1>
          <p className={`text-sm text-foreground-secondary ${mobileView ? '' : 'sm:text-body'}`}>
            從統一發票自動追蹤和分析您的碳排放量
          </p>
          {mobileView && (
            <div className='mt-2 rounded-lg bg-primary-50 p-2 text-xs text-primary-700'>
              📱 手機布局預覽模式
            </div>
          )}
        </div>

        {/* 本月碳排對比區塊 */}
        <div className={`mb-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white shadow-lg ${mobileView ? '' : 'sm:mb-6 sm:p-6'}`}>
          <div className='mb-3 flex items-center justify-between sm:mb-4'>
            <div>
              <div className={`mb-1 text-xs opacity-90 ${mobileView ? '' : 'sm:text-sm'}`}>本月碳排放</div>
              <div className={`text-2xl font-bold ${mobileView ? '' : 'sm:text-3xl md:text-4xl'}`}>
                {monthlyStats.currentMonth.toFixed(2)} kg CO₂
              </div>
            </div>
            <div className='text-right'>
              {monthlyStats.lastMonth > 0 ? (
                <>
                  <div className={`mb-1 text-xs opacity-90 ${mobileView ? '' : 'sm:text-sm'}`}>
                    較上個月
                  </div>
                  <div className={`flex items-center gap-1 text-lg font-bold ${mobileView ? '' : 'sm:text-xl md:text-2xl'}`}>
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
                  <div className={`mt-1 text-xs opacity-75 ${mobileView ? '' : 'sm:text-sm'}`}>
                    ({monthlyStats.isIncrease ? '+' : ''}{monthlyStats.percentage.toFixed(1)}%)
                  </div>
                </>
              ) : (
                <div className={`text-xs opacity-75 ${mobileView ? '' : 'sm:text-sm'}`}>
                  無上月數據
                </div>
              )}
            </div>
          </div>
          {monthlyStats.lastMonth > 0 && (
            <div className={`mt-3 rounded-lg bg-white/20 p-2 text-xs backdrop-blur-sm ${mobileView ? '' : 'sm:text-sm'}`}>
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
          <div className='mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600 sm:mb-6 sm:p-4 sm:text-body'>
            ⚠️ {error}
          </div>
        )}

        {/* 統計卡片 */}
        <div className={`mb-4 grid grid-cols-2 gap-3 ${mobileView ? '' : 'sm:mb-6 sm:gap-4'}`}>
          <div className={`rounded-lg bg-white p-4 shadow-sm ${mobileView ? '' : 'sm:p-6'}`}>
            <div className={`mb-1 text-xs text-foreground-muted ${mobileView ? '' : 'sm:mb-2 sm:text-caption'}`}>總碳排放量</div>
            <div className={`text-xl font-semibold text-primary-600 ${mobileView ? '' : 'sm:text-2xl md:text-h1'}`}>{totalCO2.toFixed(2)}</div>
            <div className={`text-xs text-foreground-muted ${mobileView ? '' : 'sm:text-caption'}`}>kg CO₂</div>
          </div>
          <div className={`rounded-lg bg-white p-4 shadow-sm ${mobileView ? '' : 'sm:p-6'}`}>
            <div className={`mb-1 text-xs text-foreground-muted ${mobileView ? '' : 'sm:mb-2 sm:text-caption'}`}>記錄數量</div>
            <div className={`text-xl font-semibold text-primary-600 ${mobileView ? '' : 'sm:text-2xl md:text-h1'}`}>{filteredRecords.length}</div>
            <div className={`text-xs text-foreground-muted ${mobileView ? '' : 'sm:text-caption'}`}>筆記錄</div>
          </div>
        </div>

        {/* 類別統計 */}
        {Object.keys(categoryStats).length > 0 && (
          <div className={`mb-4 rounded-lg bg-white p-4 shadow-sm ${mobileView ? '' : 'sm:mb-6 sm:p-6'}`}>
            <h2 className={`mb-3 text-lg font-semibold text-foreground-primary ${mobileView ? '' : 'sm:mb-4 sm:text-xl md:text-h2'}`}>碳排組成</h2>
            <div className={`space-y-2.5 ${mobileView ? '' : 'sm:space-y-3'}`}>
              {Object.entries(categoryStats)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => {
                  const categoryInfo = CARBON_CATEGORIES.find(c => c.label === category)
                  return (
                    <div key={category} className={`flex flex-col gap-2 ${mobileView ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
                      <div className='flex items-center gap-2'>
                        {getCategoryIconElement(
                          CARBON_CATEGORIES.find(c => c.label === category)?.value || 'other',
                          'md'
                        )}
                        <span className={`text-sm text-foreground-primary ${mobileView ? '' : 'sm:text-body'}`}>{category}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className={`h-2 flex-1 rounded-full bg-grey-200 ${mobileView ? '' : 'sm:min-w-[120px] md:min-w-[200px]'}`}>
                          <div
                            className='h-2 rounded-full bg-primary-500'
                            style={{
                              width: `${totalCO2 > 0 ? (amount / totalCO2) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <span className={`text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:text-sm md:text-body'}`}>
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
        <div className={`rounded-lg bg-white p-4 shadow-sm ${mobileView ? '' : 'sm:p-6'}`}>
          <div className={`mb-3 flex items-center justify-between ${mobileView ? '' : 'sm:mb-4'}`}>
            <h2 className={`text-lg font-semibold text-foreground-primary ${mobileView ? '' : 'sm:text-xl md:text-h2'}`}>記錄列表</h2>
            {loading && (
              <div className={`text-xs text-foreground-muted ${mobileView ? '' : 'sm:text-caption'}`}>載入中...</div>
            )}
          </div>
          {loading && records.length === 0 ? (
            <div className={`py-8 text-center ${mobileView ? '' : 'sm:py-12'}`}>
              <div className={`mb-3 text-3xl animate-pulse ${mobileView ? '' : 'sm:mb-4 sm:text-4xl'}`}>📄</div>
              <p className={`text-sm text-foreground-muted ${mobileView ? '' : 'sm:text-body'}`}>正在載入統一發票數據...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className={`py-8 text-center ${mobileView ? '' : 'sm:py-12'}`}>
              <div className={`mb-3 text-3xl ${mobileView ? '' : 'sm:mb-4 sm:text-4xl'}`}>🔍</div>
              <p className={`text-sm text-foreground-muted ${mobileView ? '' : 'sm:text-body'}`}>
                {hasActiveFilters ? '沒有符合條件的記錄' : '尚無發票記錄'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className={`mt-3 text-sm text-primary-600 hover:text-primary-700 ${mobileView ? '' : 'sm:mt-4 sm:text-body'}`}
                >
                  清除過濾條件
                </button>
              )}
            </div>
          ) : (
            <div className={`space-y-2.5 ${mobileView ? '' : 'sm:space-y-3'}`}>
              {filteredRecords.map((record) => {
                const isExpanded = expandedRecords.has(record.id)
                return (
                  <div
                    key={record.id}
                    className='rounded-lg border border-grey-200 bg-white transition-colors hover:bg-grey-50'
                  >
                    {/* 主要記錄資訊 */}
                    <div
                      className={`flex flex-col gap-3 p-3 cursor-pointer ${mobileView ? '' : 'sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4'}`}
                      onClick={() => toggleRecordExpansion(record.id)}
                    >
                      <div className={`flex items-start gap-3 ${mobileView ? '' : 'sm:items-center sm:gap-4'}`}>
                        <div className={`${mobileView ? '' : 'sm:'}`}>
                          {getCategoryIconElement(record.category, 'lg')}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className={`mb-1.5 flex flex-wrap items-center gap-1.5 ${mobileView ? '' : 'sm:mb-1 sm:gap-2'}`}>
                            <span className={`text-sm font-semibold text-foreground-primary break-words ${mobileView ? '' : 'sm:text-body'}`}>
                              {record.storeName}
                            </span>
                            <span className={`rounded-full px-1.5 py-0.5 text-xs ${mobileView ? '' : 'sm:px-2 sm:text-caption'} ${getCategoryColor(record.category)}`}>
                              {getCategoryLabel(record.category)}
                            </span>
                          </div>
                          <div className={`flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted ${mobileView ? '' : 'sm:gap-2 sm:text-caption'}`}>
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
                      <div className={`flex items-center justify-between ${mobileView ? '' : 'sm:flex-col sm:items-end sm:justify-center'}`}>
                        <div className={`text-base font-semibold text-primary-600 ${mobileView ? '' : 'sm:text-lg md:text-h3'}`}>
                          {record.totalCO2.toFixed(2)} kg
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className={`text-xs text-foreground-muted ${mobileView ? '' : 'sm:text-caption'}`}>CO₂</div>
                          <span className={`text-foreground-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 展開的明細 */}
                    {isExpanded && (
                      <div className='border-t border-grey-200 bg-grey-50 p-3 sm:p-4'>
                        <div className={`mb-2 text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:text-sm'}`}>
                          商品明細
                        </div>
                        <div className='space-y-2'>
                          {record.items.map((item, index) => (
                            <div
                              key={index}
                              className='flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm sm:p-3'
                            >
                              <div className='flex-1 min-w-0'>
                                <div className={`mb-1 flex items-center gap-2 ${mobileView ? '' : 'sm:mb-1.5'}`}>
                                  <span className={`text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:text-sm'}`}>
                                    {item.name}
                                  </span>
                                  <span className={`rounded-full px-1.5 py-0.5 text-xs ${getCategoryColor(item.category)}`}>
                                    {getCategoryLabel(item.category)}
                                  </span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs text-foreground-muted ${mobileView ? '' : 'sm:text-sm'}`}>
                                  <span>數量: {item.quantity}</span>
                                  <span>·</span>
                                  <span>NT$ {item.amount.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className='ml-3 text-right'>
                                <div className={`text-xs font-semibold text-primary-600 ${mobileView ? '' : 'sm:text-sm'}`}>
                                  {item.co2Amount.toFixed(2)} kg
                                </div>
                                <div className='text-xs text-foreground-muted'>CO₂</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-3 flex items-center justify-between rounded-lg bg-primary-50 p-2 text-xs font-semibold text-primary-700 ${mobileView ? '' : 'sm:text-sm'}`}>
                          <span>總計</span>
                          <span>{record.totalCO2.toFixed(2)} kg CO₂</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 搜索和過濾區域 */}
        <div className={`mb-4 rounded-lg bg-white p-4 shadow-sm ${mobileView ? '' : 'sm:mb-6 sm:p-6'}`}>
          <div className={`mb-3 flex flex-col gap-2 ${mobileView ? '' : 'sm:mb-4 sm:flex-row sm:items-center sm:justify-between'}`}>
            <h2 className={`text-lg font-semibold text-foreground-primary ${mobileView ? '' : 'sm:text-xl md:text-h2'}`}>查詢碳排</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className='self-start text-xs text-primary-600 hover:text-primary-700 sm:text-caption'
              >
                清除所有過濾
              </button>
            )}
          </div>

          <div className={`grid gap-3 ${mobileView ? '' : 'sm:gap-4 sm:grid-cols-2 lg:grid-cols-4'}`}>
            {/* 搜索框 */}
            <div className={mobileView ? '' : 'sm:col-span-2 lg:col-span-2'}>
              <label className={`mb-1.5 block text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:mb-2 sm:text-caption'}`}>
                搜尋商品/服務
              </label>
              <div className='relative'>
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='輸入商品名稱、服務名稱或商店名稱...'
                  className={`w-full rounded-lg border border-grey-300 px-3 py-2.5 pl-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${mobileView ? '' : 'sm:px-4 sm:pl-10 sm:text-body'}`}
                />
                <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted ${mobileView ? '' : 'sm:left-3'}`}>🔍</span>
              </div>
            </div>

            {/* 類型過濾 */}
            <div>
              <label className={`mb-1.5 block text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:mb-2 sm:text-caption'}`}>
                類型
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className={`w-full rounded-lg border border-grey-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${mobileView ? '' : 'sm:px-4 sm:text-body'}`}
              >
                <option value='all'>全部</option>
                <option value='product'>商品</option>
                <option value='service'>服務</option>
              </select>
            </div>

            {/* 類別過濾 */}
            <div>
              <label className={`mb-1.5 block text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:mb-2 sm:text-caption'}`}>
                類別
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full rounded-lg border border-grey-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${mobileView ? '' : 'sm:px-4 sm:text-body'}`}
              >
                <option value='all'>全部類別</option>
                {CARBON_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 日期範圍 */}
          <div className={`mt-3 grid gap-3 ${mobileView ? '' : 'sm:mt-4 sm:gap-4 sm:grid-cols-3'}`}>
            <div>
              <label className={`mb-1.5 block text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:mb-2 sm:text-caption'}`}>
                開始日期
              </label>
              <input
                type='date'
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className={`w-full rounded-lg border border-grey-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${mobileView ? '' : 'sm:px-4 sm:text-body'}`}
              />
            </div>
            <div>
              <label className={`mb-1.5 block text-xs font-semibold text-foreground-primary ${mobileView ? '' : 'sm:mb-2 sm:text-caption'}`}>
                結束日期
              </label>
              <input
                type='date'
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className={`w-full rounded-lg border border-grey-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${mobileView ? '' : 'sm:px-4 sm:text-body'}`}
              />
            </div>
            <div className='flex items-end'>
              <button
                onClick={fetchInvoices}
                disabled={loading}
                className={`w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:bg-grey-400 disabled:cursor-not-allowed ${mobileView ? '' : 'sm:px-6 sm:text-body'}`}
              >
                {loading ? '載入中...' : '🔄 重新載入'}
              </button>
            </div>
          </div>

          {/* 過濾結果統計 */}
          {hasActiveFilters && (
            <div className={`mt-3 rounded-lg bg-primary-50 p-2.5 text-xs text-primary-700 ${mobileView ? '' : 'sm:mt-4 sm:p-3 sm:text-caption'}`}>
              顯示 {filteredRecords.length} 筆記錄（共 {records.length} 筆）
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
