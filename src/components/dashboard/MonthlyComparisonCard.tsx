import type { MonthlyStats } from './types'

interface MonthlyComparisonCardProps {
  stats: MonthlyStats
}

export const MonthlyComparisonCard = ({
  stats,
}: MonthlyComparisonCardProps) => {
  const hasLastMonthData = stats.lastMonth > 0

  return (
    <div className='mb-4 rounded-lg bg-linear-to-r from-primary-500 to-primary-600 p-4 text-white shadow-lg'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='mb-1 text-xs opacity-90'>本月碳排放</div>
          <div className='font-bold text-2xl'>
            {stats.currentMonth.toFixed(2)} kg CO₂
          </div>
        </div>
        <div className='text-right'>
          {hasLastMonthData ? (
            <>
              <div className='mb-1 text-xs opacity-90'>較上個月</div>
              <div className='flex items-center gap-1 font-bold text-lg'>
                {stats.isIncrease ? (
                  <>
                    <span>📈</span>
                    <span className='text-red-200'>
                      +{stats.difference.toFixed(2)} kg
                    </span>
                  </>
                ) : (
                  <>
                    <span>📉</span>
                    <span className='text-green-200'>
                      {stats.difference.toFixed(2)} kg
                    </span>
                  </>
                )}
              </div>
              <div className='mt-1 text-xs opacity-75'>
                ({stats.isIncrease ? '+' : ''}
                {stats.percentage.toFixed(1)}%)
              </div>
            </>
          ) : (
            <div className='text-xs opacity-75'>無上月數據</div>
          )}
        </div>
      </div>
      {hasLastMonthData && (
        <div className='mt-3 rounded-lg bg-white/20 p-2 text-xs backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <span>上月碳排放：{stats.lastMonth.toFixed(2)} kg CO₂</span>
            <span
              className={stats.isIncrease ? 'text-red-200' : 'text-green-200'}
            >
              {stats.isIncrease ? '增加' : '減少'}{' '}
              {Math.abs(stats.percentage).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
