import Link from 'next/link'

import { CarbonRecord } from './types'
import {
  getCategoryColor,
  getCategoryIconElement,
  getCategoryLabel,
} from './utils'

interface RecentRecordsProps {
  loading: boolean
  records: CarbonRecord[]
  sortedRecords: CarbonRecord[]
  recentRecords: CarbonRecord[]
  expandedRecords: Set<string>
  onToggle(recordId: string): void
  hasMoreRecords: boolean
}

export const RecentRecords = ({
  loading,
  records,
  sortedRecords,
  recentRecords,
  expandedRecords,
  onToggle,
  hasMoreRecords,
}: RecentRecordsProps) => {
  return (
    <div className='rounded-lg bg-white p-4 shadow-sm'>
      <div className='mb-3 flex items-center justify-between'>
        <h2 className='text-lg font-semibold text-foreground-primary'>
          最近紀錄
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
                  <button
                    type='button'
                    className='flex w-full flex-col gap-3 p-3 text-left'
                    onClick={() => onToggle(record.id)}
                  >
                    <div className='flex items-start gap-3'>
                      <div>{getCategoryIconElement(record.category, 'lg')}</div>
                      <div className='min-w-0 flex-1'>
                        <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
                          <span className='break-words text-sm font-semibold text-foreground-primary'>
                            {record.storeName}
                          </span>
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-xs ${getCategoryColor(
                              record.category,
                            )}`}
                          >
                            {getCategoryLabel(record.category)}
                          </span>
                        </div>
                        <div className='flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted'>
                          <span className='font-semibold text-foreground-primary'>
                            NT$ {record.totalAmount.toLocaleString()}
                          </span>
                          <span>·</span>
                          <span className='font-mono text-xs'>
                            發票: {record.invoiceNumber}
                          </span>
                          <span>·</span>
                          <span>
                            {new Date(record.date).toLocaleDateString('zh-TW')}
                          </span>
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
                        <span
                          className={`text-foreground-muted transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        >
                          ▼
                        </span>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className='border-t border-grey-200 bg-grey-50 p-3'>
                      <div className='mb-2 text-xs font-semibold text-foreground-primary'>
                        商品明細
                      </div>
                      <div className='space-y-2'>
                        {record.items.map((item, index) => (
                          <div
                            key={`${record.id}-${index}`}
                            className='flex items-center justify-between rounded-lg bg-white p-2.5 shadow-sm'
                          >
                            <div className='min-w-0 flex-1'>
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
                              <div className='text-xs text-foreground-muted'>
                                CO₂
                              </div>
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
              <Link
                href='/records'
                className='inline-block rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700'
              >
                查看全部記錄 ({sortedRecords.length} 筆)
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}


