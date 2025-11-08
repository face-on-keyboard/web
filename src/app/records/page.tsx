'use client'

import { useRecords } from '@/components/fetchers/records'
import {
  getCategoryColor,
  getCategoryIconElement,
  getCategoryLabel,
} from '@/lib/carbon-records'
import Link from 'next/link'
import { useState } from 'react'

type SortOption = 'date' | 'category'

export default function RecordsPage() {
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const { records, loading, error, sortedRecords, totalCO2 } = useRecords()

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

  return (
    <main className='min-h-screen bg-background-muted px-3 py-4'>
      <div className='mx-auto max-w-sm'>
        {/* 標題區域 */}
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <Link
              href='/'
              className='text-primary-600 text-xs hover:text-primary-700'
            >
              ← 返回首頁
            </Link>
            <h1 className='mt-2 mb-1 font-semibold text-2xl text-foreground-primary'>
              全部記錄
            </h1>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className='mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-600 text-sm'>
            ⚠️ {JSON.stringify(error)}
          </div>
        )}

        {/* 統計資訊 */}
        {!loading && sortedRecords.length > 0 && (
          <div className='mb-4 grid grid-cols-2 gap-3'>
            <div className='rounded-lg bg-white p-4 shadow-sm'>
              <div className='mb-1 text-foreground-muted text-xs'>總記錄數</div>
              <div className='font-semibold text-primary-600 text-xl'>
                {sortedRecords.length}
              </div>
              <div className='text-foreground-muted text-xs'>筆記錄</div>
            </div>
            <div className='rounded-lg bg-white p-4 shadow-sm'>
              <div className='mb-1 text-foreground-muted text-xs'>
                總碳排放量
              </div>
              <div className='font-semibold text-primary-600 text-xl'>
                {totalCO2?.toFixed(2)}
              </div>
              <div className='text-foreground-muted text-xs'>kg CO₂</div>
            </div>
          </div>
        )}

        {/* 記錄列表 */}
        <div className='rounded-lg bg-white p-4 shadow-sm'>
          <div className='mb-3 flex items-center justify-between'>
            {loading && (
              <div className='text-foreground-muted text-xs'>載入中...</div>
            )}
            {!loading && sortedRecords.length > 0 && (
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={() => setSortBy('date')}
                  className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-colors ${
                    sortBy === 'date'
                      ? 'bg-primary-500 text-white'
                      : 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
                  }`}
                >
                  按日期
                </button>
                <button
                  type='button'
                  onClick={() => setSortBy('category')}
                  className={`rounded-lg px-3 py-1.5 font-semibold text-xs transition-colors ${
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
          {loading && records?.length === 0 ? (
            <div className='py-8 text-center'>
              <div className='mb-3 animate-pulse text-3xl'>📄</div>
              <p className='text-foreground-muted text-sm'>
                正在載入統一發票數據...
              </p>
            </div>
          ) : sortedRecords.length === 0 ? (
            <div className='py-8 text-center'>
              <div className='mb-3 text-3xl'>📄</div>
              <p className='text-foreground-muted text-sm'>尚無發票記錄</p>
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
                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                    <div
                      className='flex cursor-pointer flex-col gap-3 p-3'
                      onClick={() => toggleRecordExpansion(record.id)}
                    >
                      <div className='flex items-start gap-3'>
                        <div>
                          {getCategoryIconElement(record.category, 'lg')}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
                            <span className='wrap-break-word font-semibold text-foreground-primary text-sm'>
                              {record.storeName}
                            </span>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-xs ${getCategoryColor(
                                record.category
                              )}`}
                            >
                              {getCategoryLabel(record.category)}
                            </span>
                          </div>
                          <div className='flex flex-wrap items-center gap-1.5 text-foreground-muted text-xs'>
                            <span className='font-semibold text-foreground-primary'>
                              NT$ {record.totalAmount.toLocaleString()}
                            </span>
                            <span>·</span>
                            <span className='font-mono text-xs'>
                              發票: {record.invoiceNumber}
                            </span>
                            <span>·</span>
                            <span>
                              {new Date(record.date).toLocaleDateString(
                                'zh-TW'
                              )}
                            </span>
                            <span>·</span>
                            <span>{record.items.length} 項商品</span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center justify-between'>
                        <div className='font-semibold text-base text-primary-600'>
                          {record.totalCO2.toFixed(2)} kg
                        </div>
                        <div className='flex items-center gap-2'>
                          <div className='text-foreground-muted text-xs'>
                            CO₂
                          </div>
                          <span
                            className={`text-foreground-muted transition-transform ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          >
                            ▼
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 展開的明細 */}
                    {isExpanded && (
                      <div className='border-grey-200 border-t bg-grey-50 p-3'>
                        <div className='mb-2 font-semibold text-foreground-primary text-xs'>
                          商品明細
                        </div>
                        <div className='space-y-2'>
                          {record.items.map((item, index) => (
                            <div
                              key={`${item.name}-${index}`}
                              className='flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm'
                            >
                              <div className='min-w-0 flex-1'>
                                <div className='mb-1'>
                                  <span className='font-semibold text-foreground-primary text-xs'>
                                    {item.name}
                                  </span>
                                </div>
                                <div className='flex items-center gap-2 text-foreground-muted text-xs'>
                                  <span>數量: {item.quantity}</span>
                                  <span>·</span>
                                  <span>
                                    NT$ {item.amount.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className='ml-3 text-right'>
                                <div className='font-semibold text-primary-600 text-xs'>
                                  {item.co2Amount.toFixed(2)} kg
                                </div>
                                <div className='text-foreground-muted text-xs'>
                                  CO₂
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className='mt-3 flex items-center justify-between rounded-lg bg-primary-50 p-2 font-semibold text-primary-700 text-xs'>
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
