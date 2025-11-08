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

export default function RecordsPage() {
  const [records, setRecords] = useState<CarbonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/invoices')
        if (!response.ok) {
          throw new Error('Failed to fetch invoices')
        }
        const data = await response.json()
        
        // API 返回格式：{ records: [...] }
        if (data.records && Array.isArray(data.records)) {
          // 數據已經由 API 處理好，直接使用
          setRecords(data.records)
        } else {
          setError('數據格式錯誤')
        }
      } catch (err) {
        console.error('Error fetching invoices:', err)
        setError('載入發票數據失敗')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  // 輔助函數：獲取類別標籤
  const getCategoryLabel = (categoryValue: string) => {
    const category = CARBON_CATEGORIES.find(c => c.value === categoryValue)
    return category?.label || '其他'
  }

  const sortedRecords = useMemo(() => {
    const sorted = [...records]
    sorted.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'date') {
        // 按日期排序
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      } else if (sortBy === 'category') {
        // 按類型（類別）排序
        const categoryA = getCategoryLabel(a.category)
        const categoryB = getCategoryLabel(b.category)
        comparison = categoryA.localeCompare(categoryB, 'zh-TW')
        // 如果類型相同，再按日期排序
        if (comparison === 0) {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        }
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [records, sortBy, sortOrder])

  const totalCO2 = useMemo(() => {
    return records.reduce((sum, record) => sum + record.totalCO2, 0)
  }, [records])

  const totalAmount = useMemo(() => {
    return records.reduce((sum, record) => sum + record.totalAmount, 0)
  }, [records])

  const getCategoryIconElement = (categoryValue: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const category = CARBON_CATEGORIES.find(c => c.value === categoryValue)
    if (!category) return <span className='text-lg'>📝</span>
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }
    
    if (category.iconType === 'image') {
      return (
        <img
          src={category.icon}
          alt={category.label}
          className={sizeClasses[size]}
        />
      )
    }
    
    return <span className='text-lg'>{category.icon}</span>
  }

  const getCategoryColor = (categoryValue: string) => {
    const category = CARBON_CATEGORIES.find(c => c.value === categoryValue)
    return category?.color || 'bg-grey-100 text-grey-700'
  }

  if (loading) {
    return (
      <main className='min-h-screen bg-background-muted py-4 px-3'>
        <div className='mx-auto max-w-sm'>
          <div className='py-8 text-center'>
            <div className='mb-3 text-3xl animate-pulse'>📄</div>
            <p className='text-sm text-foreground-muted'>正在載入統一發票數據...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className='min-h-screen bg-background-muted py-4 px-3'>
        <div className='mx-auto max-w-sm'>
          <div className='py-8 text-center'>
            <div className='mb-3 text-3xl'>❌</div>
            <p className='text-sm text-foreground-muted'>{error}</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className='min-h-screen bg-background-muted py-4 px-3'>
      <div className='mx-auto max-w-sm'>
        {/* 標題和返回按鈕 */}
        <div className='mb-4 flex items-center justify-between'>
          <h1 className='text-xl font-bold text-foreground-primary'>全部記錄</h1>
          <Link
            href='/profile'
            className='rounded-lg bg-grey-100 px-3 py-1.5 text-xs font-semibold text-foreground-primary transition-colors hover:bg-grey-200'
          >
            返回
          </Link>
        </div>

        {/* 統計資訊 */}
        <div className='mb-4 grid grid-cols-2 gap-3'>
          <div className='rounded-lg border border-grey-200 bg-white p-3'>
            <div className='text-[10px] text-foreground-muted'>總碳排量</div>
            <div className='mt-1 text-base font-semibold text-foreground-primary'>
              {totalCO2.toFixed(2)} kg CO₂
            </div>
          </div>
          <div className='rounded-lg border border-grey-200 bg-white p-3'>
            <div className='text-[10px] text-foreground-muted'>總金額</div>
            <div className='mt-1 text-base font-semibold text-foreground-primary'>
              NT$ {totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 排序選項 */}
        <div className='mb-4 flex items-center gap-2'>
          <span className='text-xs text-foreground-muted'>排序方式：</span>
          <button
            onClick={() => setSortBy('date')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              sortBy === 'date'
                ? 'bg-primary-500 text-white'
                : 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
            }`}
          >
            日期
          </button>
          <button
            onClick={() => setSortBy('category')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              sortBy === 'category'
                ? 'bg-primary-500 text-white'
                : 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
            }`}
          >
            類型
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className='rounded-lg border border-grey-200 bg-white px-2.5 py-1.5 text-xs transition-colors hover:bg-grey-50'
            aria-label={sortOrder === 'asc' ? '升序' : '降序'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>

        {/* 記錄列表 */}
        {sortedRecords.length === 0 ? (
          <div className='py-8 text-center'>
            <div className='mb-3 text-2xl'>📄</div>
            <p className='text-xs text-foreground-muted'>尚無發票記錄</p>
          </div>
        ) : (
          <div className='space-y-3'>
            {sortedRecords.map((record) => (
              <div
                key={record.id}
                className='rounded-lg border border-grey-200 bg-white p-3 shadow-sm'
              >
                <div className='mb-2 flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='mb-1.5 flex items-center gap-2'>
                      {getCategoryIconElement(record.category, 'md')}
                      <h3 className='text-base font-semibold text-foreground-primary'>
                        {record.storeName}
                      </h3>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${getCategoryColor(record.category)}`}>
                        {getCategoryLabel(record.category)}
                      </span>
                    </div>
                    <div className='mb-1 text-xs text-foreground-muted'>
                      {new Date(record.date).toLocaleDateString('zh-TW')}
                    </div>
                    <div className='text-xs text-foreground-muted'>
                      發票號碼：{record.invoiceNumber}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-base font-semibold text-primary-600'>
                      {record.totalCO2.toFixed(2)} kg CO₂
                    </div>
                    <div className='text-xs text-foreground-muted'>
                      NT$ {record.totalAmount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 商品列表 */}
                <div className='mt-2 border-t border-grey-200 pt-2'>
                  <div className='mb-1.5 text-[10px] font-semibold text-foreground-muted'>
                    商品 ({record.items.length})
                  </div>
                  <div className='space-y-1.5'>
                    {record.items.map((item, index) => (
                      <div key={index} className='flex items-center justify-between text-xs'>
                        <div className='flex items-center gap-2'>
                          <span className='text-foreground-primary'>{item.name}</span>
                          <span className='text-foreground-muted'>x{item.quantity}</span>
                        </div>
                        <div className='flex items-center gap-3'>
                          <span className='text-foreground-muted'>
                            {item.co2Amount.toFixed(2)} kg CO₂
                          </span>
                          <span className='text-foreground-primary'>
                            NT$ {item.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

