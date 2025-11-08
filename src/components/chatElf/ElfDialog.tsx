'use client'

import { useRecords } from '@/components/fetchers/records'
import { useEffect, useState } from 'react'

const ELF_MESSAGES = [
	'地球小幫手報告：再少一點碳排，今天就更完美了！',
	'我們來挑戰一下！今天能不能比昨天少排一點碳呢？',
	'我聞到一點碳的味道， 要不要一起幫空氣洗洗澡？',
	'嘿，我們今天也來一場低碳冒險，你覺得如何？',
]

const SPECIAL_MESSAGES = {
	nearLimit: '小提醒：本週的碳排量有點高，要不要看看減碳小妙招？',
	nearRecord: '你的減碳進度超棒，再努力一點就能打破上週紀錄！',
}

export function ChatElf() {
	const { weeklyCO2, lastWeekCO2 } = useRecords()
	const [randomMessage, setRandomMessage] = useState(ELF_MESSAGES[0] ?? '')
	const [isVisible, setIsVisible] = useState(true)

	// 每次組件載入時選擇對話文字
	useEffect(() => {
		// 只在客戶端執行
		if (typeof window === 'undefined') return

		// 獲取目標上限（從 localStorage，預設 226kg - 全台一週平均）
		let carbonLimit = 226 // 預設值
		try {
			const carbonLimitStr = localStorage.getItem('carbonLimit')
			if (carbonLimitStr) {
				// 嘗試解析為數字（可能是字符串格式的數字或 JSON 格式）
				const parsed = Number.parseFloat(carbonLimitStr)
				if (!Number.isNaN(parsed) && parsed > 0) {
					carbonLimit = parsed
				} else {
					// 如果不是數字，嘗試 JSON 解析
					const jsonParsed = JSON.parse(carbonLimitStr)
					if (typeof jsonParsed === 'number' && jsonParsed > 0) {
						carbonLimit = jsonParsed
					}
				}
			}
		} catch (error) {
			// 如果解析失敗，使用預設值
			console.warn('Failed to parse carbonLimit from localStorage:', error)
		}

		// 計算本週碳排量（如果沒有數據則為 0）
		const currentWeeklyCO2 = weeklyCO2 ?? 0
		// 上週碳排量（如果沒有數據則為 0）
		const lastWeekTotal = lastWeekCO2 ?? 0

		// 判斷是否接近目標上限（達到 80% 以上）
		const isNearLimit =
			carbonLimit > 0 && currentWeeklyCO2 >= carbonLimit * 0.8

		// 判斷是否快低於上週紀錄（本週碳排量還高於上週，但很接近，差距在 10% 以內）
		// 或者本週已經低於上週，但差距很小（在 10% 以內），表示剛剛打破紀錄
		// 即：本週與上週的差距在 10% 以內
		const isNearRecord =
			lastWeekTotal > 0 &&
			Math.abs(currentWeeklyCO2 - lastWeekTotal) <= lastWeekTotal * 0.1

		// 決定顯示的對話
		let selectedMessage = ELF_MESSAGES[0] ?? ''

		if (isNearLimit) {
			// 接近目標上限時，70% 機率顯示特殊對話
			if (Math.random() < 0.7) {
				selectedMessage = SPECIAL_MESSAGES.nearLimit
			} else {
				// 30% 機率顯示一般對話
				const randomIndex = Math.floor(
					Math.random() * ELF_MESSAGES.length,
				)
				selectedMessage = ELF_MESSAGES[randomIndex] ?? ELF_MESSAGES[0] ?? ''
			}
		} else if (isNearRecord) {
			// 接近打破上週紀錄時，75% 機率顯示特殊對話
			if (Math.random() < 0.75) {
				selectedMessage = SPECIAL_MESSAGES.nearRecord
			} else {
				// 25% 機率顯示一般對話
				const randomIndex = Math.floor(
					Math.random() * ELF_MESSAGES.length,
				)
				selectedMessage = ELF_MESSAGES[randomIndex] ?? ELF_MESSAGES[0] ?? ''
			}
		} else {
			// 其他情況，隨機顯示一般對話
			const randomIndex = Math.floor(Math.random() * ELF_MESSAGES.length)
			selectedMessage = ELF_MESSAGES[randomIndex] ?? ELF_MESSAGES[0] ?? ''
		}

		setRandomMessage(selectedMessage)
	}, [weeklyCO2, lastWeekCO2])

	if (!isVisible) return null

	return (
		<div
			className='fixed right-24 z-40 w-[240px] transition-all duration-300'
			style={{
				bottom: 'calc(var(--mobile-bar-full-height) + 3rem)',
				transform: 'translateY(50%)',
			}}
		>
			{/* 對話框 */}
			<div className='relative rounded-lg bg-primary-50 p-2 shadow-lg'>
				{/* 關閉按鈕 - 放在左側 */}
				<button
					onClick={() => setIsVisible(false)}
					className='absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-grey-200 text-grey-600 shadow-md transition-colors hover:bg-grey-300'
					aria-label='關閉'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='14'
						height='14'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='M18 6L6 18' />
						<path d='M6 6l12 12' />
					</svg>
				</button>

				<div className='relative rounded-lg bg-white p-2 shadow-sm'>
					<p className='text-xs leading-tight text-foreground-primary'>
						{randomMessage}
					</p>
					{/* 右下角提示文字 */}
					<p className='-mt-0.5 text-right text-[10px] leading-tight text-foreground-muted'>
						點擊雲朵獲取減碳幫助
					</p>
				</div>
			</div>
		</div>
	)
}
