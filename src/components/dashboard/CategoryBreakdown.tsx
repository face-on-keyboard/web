import { CategoryStats, CARBON_CATEGORIES } from './constants'
import { getCategoryIconElement } from './utils'

interface CategoryBreakdownProps {
  categoryStats: CategoryStats
  totalCO2: number
}

export const CategoryBreakdown = ({
  categoryStats,
  totalCO2,
}: CategoryBreakdownProps) => {
  if (Object.keys(categoryStats).length === 0) {
    return null
  }

  return (
    <div className='mb-4 rounded-lg bg-white p-4 shadow-sm'>
      <h2 className='mb-3 text-lg font-semibold text-foreground-primary'>
        碳排組成
      </h2>
      <div className='space-y-2.5'>
        {Object.entries(categoryStats)
          .sort(([, a], [, b]) => b - a)
          .map(([category, amount]) => (
            <div key={category} className='flex flex-col gap-2'>
              <div className='flex items-center gap-2'>
                {getCategoryIconElement(
                  CARBON_CATEGORIES.find((c) => c.label === category)?.value ??
                    'other',
                  'md',
                )}
                <span className='text-sm text-foreground-primary'>
                  {category}
                </span>
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
          ))}
      </div>
    </div>
  )
}


