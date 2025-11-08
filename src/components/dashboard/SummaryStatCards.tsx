interface SummaryStatCardsProps {
  totalCO2: number
  recordsCount: number
}

export const SummaryStatCards = ({
  totalCO2,
  recordsCount,
}: SummaryStatCardsProps) => {
  return (
    <div className='mb-4 grid grid-cols-2 gap-3'>
      <div className='rounded-lg bg-white p-4 shadow-sm'>
        <div className='mb-1 text-xs text-foreground-muted'>總碳排放量</div>
        <div className='text-xl font-semibold text-primary-600'>
          {totalCO2.toFixed(2)}
        </div>
        <div className='text-xs text-foreground-muted'>kg CO₂</div>
      </div>
      <div className='rounded-lg bg-white p-4 shadow-sm'>
        <div className='mb-1 text-xs text-foreground-muted'>記錄數量</div>
        <div className='text-xl font-semibold text-primary-600'>
          {recordsCount}
        </div>
        <div className='text-xs text-foreground-muted'>筆記錄</div>
      </div>
    </div>
  )
}


