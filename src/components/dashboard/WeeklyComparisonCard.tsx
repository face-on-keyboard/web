import type { WeeklyStats } from './types'

interface WeeklyComparisonCardProps {
  stats: WeeklyStats
}

export const WeeklyComparisonCard = ({ stats }: WeeklyComparisonCardProps) => {
  const hasLastWeekData = stats.lastWeek > 0

  return (
    <div className='mb-4 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white shadow-lg'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <div className='mb-1 text-xs opacity-90'>本週碳排放</div>
          <div className='font-bold text-2xl'>
            {stats.currentWeek.toFixed(2)} kg CO₂
          </div>
        </div>
        <div className='text-right'>
          {hasLastWeekData ? (
            <>
              <div className='mb-1 text-xs opacity-90'>相較上週</div>
              <div className='flex items-center gap-1 font-bold text-lg'>
                {stats.isIncrease ? (
                  <>
                    <span className='text-red-200'>
                      +{stats.difference.toFixed(2)} kg
                    </span>
                  </>
                ) : (
                  <>
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
            <div className='text-xs opacity-75'>無上週數據</div>
          )}
        </div>
      </div>
      {hasLastWeekData && (
        <div className='mt-3 rounded-lg bg-white/20 p-2 text-xs backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <span>上週碳排放：{stats.lastWeek.toFixed(2)} kg CO₂</span>
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
