'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

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

type SortOption = 'date' | 'category'

export default function RecordsPage() {
  const [records, setRecords] = useState<CarbonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('date')

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

  // 輔助函數：獲取類別標籤
  const getCategoryLabel = (categoryValue: string) => {
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue
  }

  // 根據選擇的排序方式排序
  const sortedRecords = useMemo(() => {
    const recordsCopy = [...records]
    
    if (sortBy === 'date') {
      // 按日期排序，最新的在前
      return recordsCopy.sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
    } else if (sortBy === 'category') {
      // 按類別排序，相同類別按日期排序
      return recordsCopy.sort((a, b) => {
        // 獲取類別標籤進行排序
        const categoryA = getCategoryLabel(a.category)
        const categoryB = getCategoryLabel(b.category)
        
        // 先按類別標籤排序
        const categoryCompare = categoryA.localeCompare(categoryB, 'zh-TW')
        if (categoryCompare !== 0) {
          return categoryCompare
        }
        // 相同類別時按日期排序，最新的在前
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
    }
    
    return recordsCopy
  }, [records, sortBy])

  // 計算總碳排放量
  const totalCO2 = useMemo(() => {
    return sortedRecords.reduce((sum, record) => sum + record.totalCO2, 0)
  }, [sortedRecords])

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

  const getCategoryColor = (categoryValue: string) => {
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.color || 'bg-grey-100 text-grey-700'
  }


  return (
    <main className='min-h-screen bg-background-muted py-4 px-3'>
      <div className='mx-auto max-w-sm'>
        {/* 標題區域 */}
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <Link href='/profile' className='text-xs text-primary-600 hover:text-primary-700'>
              ← 返回我的
            </Link>
            <h1 className='mt-2 mb-1 text-2xl font-semibold text-foreground-primary'>全部記錄</h1>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className='mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-600'>
            ⚠️ {error}
          </div>
        )}

        {/* 統計資訊 */}
        {!loading && sortedRecords.length > 0 && (
          <div className='mb-4 grid grid-cols-2 gap-3'>
            <div className='rounded-lg bg-white p-4 shadow-sm'>
              <div className='mb-1 text-xs text-foreground-muted'>總記錄數</div>
              <div className='text-xl font-semibold text-primary-600'>{sortedRecords.length}</div>
              <div className='text-xs text-foreground-muted'>筆記錄</div>
            </div>
            <div className='rounded-lg bg-white p-4 shadow-sm'>
              <div className='mb-1 text-xs text-foreground-muted'>總碳排放量</div>
              <div className='text-xl font-semibold text-primary-600'>{totalCO2.toFixed(2)}</div>
              <div className='text-xs text-foreground-muted'>kg CO₂</div>
            </div>
          </div>
        )}

        {/* 記錄列表 */}
        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            {loading && (
              <div className='text-xs text-foreground-muted'>載入中...</div>
            )}
            {!loading && sortedRecords.length > 0 && (
              <div className='flex gap-2'>
                <button
                  onClick={() => setSortBy('date')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    sortBy === 'date'
                      ? 'bg-primary-500 text-white'
                      : 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
                  }`}
                >
                  按日期
                </button>
                <button
                  onClick={() => setSortBy('category')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    sortBy === 'category'
                      ? 'bg-primary-500 text-white'
                      : 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
                  }`}
                >
                  按類別
                </button>
              </div>
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
            <div className='space-y-2.5'>
              {sortedRecords.map((record) => {
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
          )}
        </div>
      </div>
    </main>
  )
}

