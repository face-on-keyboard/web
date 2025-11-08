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
				<div className='mb-1 text-foreground-muted text-xs'>總碳排放量</div>
				<div className='font-semibold text-primary-600 text-xl'>
					{totalCO2.toFixed(2)}
				</div>
				<div className='text-foreground-muted text-xs'>kg CO₂</div>
			</div>
			<div className='rounded-lg bg-white p-4 shadow-sm'>
				<div className='mb-1 text-foreground-muted text-xs'>記錄數量</div>
				<div className='font-semibold text-primary-600 text-xl'>
					{recordsCount}
				</div>
				<div className='text-foreground-muted text-xs'>筆記錄</div>
			</div>
		</div>
	)
}
