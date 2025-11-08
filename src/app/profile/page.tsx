'use client'

import { useAchievements } from '@/components/fetchers/achievements'
import { useLeaderBoard } from '@/components/fetchers/leaderboard'
import { useRecords } from '@/components/fetchers/records'
import { useUser } from '@/components/fetchers/user'
import { Crown, Leaf } from '@/components/icons'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

interface InvoiceAccount {
	invoiceAccount: string
	invoicePassword?: string
}

interface UserProfile {
	name: string
	birthday: string
}

// 接口定義
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

// 類別常數
const CARBON_CATEGORIES = [
	{
		value: 'food',
		label: '食物',
		icon: '/icons/eat.svg',
		iconType: 'image',
		color: 'bg-green-100 text-green-700',
	},
	{
		value: 'shopping',
		label: '購物',
		icon: '/icons/shopping.svg',
		iconType: 'image',
		color: 'bg-purple-100 text-purple-700',
	},
	{
		value: 'transport',
		label: '交通',
		icon: '/icons/transport.svg',
		iconType: 'image',
		color: 'bg-blue-100 text-blue-700',
	},
	{
		value: 'other',
		label: '其他',
		icon: '/icons/other.svg',
		iconType: 'image',
		color: 'bg-grey-100 text-grey-700',
	},
]

export default function ProfilePage() {
	const { data: user, loading: isLoadingProfile } = useUser()

	const [formData, setFormData] = useState({
		agreeHealthData: false,
	})
	const [invoiceAccount, setInvoiceAccount] = useState<InvoiceAccount | null>(
		null,
	)
	const [isLoadingAccount, setIsLoadingAccount] = useState(true)
	const { data: achievements } = useAchievements()
	const [showLeaderboard, setShowLeaderboard] = useState(false)

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitMessage, setSubmitMessage] = useState<{
		type: 'success' | 'error' | null
		text: string
	}>({ type: null, text: '' })

	// 最近紀錄相關狀態
	const {
		records,
		sortedRecords,
		recentRecords,
		hasMoreRecords,
		loading,
		error,
		weeklyCO2,
	} = useRecords()
	const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())

	// 排行榜數據
	const { data: leaderboardData } = useLeaderBoard({
		userEmail: user?.email,
		weeklyCO2: weeklyCO2,
	})

	// 滾動相關狀態
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const leaderboardDataRef = useRef(leaderboardData)

	// 載入已儲存的發票帳戶資訊
	useEffect(() => {
		// 從 localStorage 讀取（前端暫存，實際應從 API 獲取）
		const storedAccount = localStorage.getItem('invoiceAccount')
		if (storedAccount) {
			try {
				setInvoiceAccount(JSON.parse(storedAccount))
			} catch (error) {
				console.error('Failed to parse invoice account:', error)
			}
		}
		setIsLoadingAccount(false)
	}, [])

	// 監聽儲存事件（當編輯頁面儲存後會觸發）
	useEffect(() => {
		const handleStorageChange = () => {
			const storedAccount = localStorage.getItem('invoiceAccount')
			if (storedAccount) {
				try {
					setInvoiceAccount(JSON.parse(storedAccount))
				} catch (error) {
					console.error('Failed to parse invoice account:', error)
				}
			} else {
				setInvoiceAccount(null)
			}
		}

		// 監聽 localStorage 變化
		window.addEventListener('storage', handleStorageChange)
		// 也監聽自定義事件（同頁面內更新）
		window.addEventListener('invoiceAccountUpdated', handleStorageChange)

		return () => {
			window.removeEventListener('storage', handleStorageChange)
			window.removeEventListener('invoiceAccountUpdated', handleStorageChange)
		}
	}, [])

	// 展開/收合功能
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

	// 排行榜用戶卡片元件
	const LeaderboardUserCard = ({
		user,
		rank,
		isCurrentUser = false,
	}: {
		user: { userId: string; userName: string; weeklyCO2: number }
		rank: number
		isCurrentUser?: boolean
	}) => {
		const isFirst = rank === 1

		return (
			<div
				className={`flex items-center gap-3 rounded-lg border p-3 ${
					isCurrentUser
						? 'border-primary-500 bg-primary-50 shadow-md'
						: 'border-grey-200 bg-white'
				}`}
			>
				{/* 排名 */}
				<div className='flex w-8 items-center justify-center'>
					<span
						className={`font-bold text-lg ${
							isFirst && !isCurrentUser
								? 'text-primary-600'
								: 'text-foreground-muted'
						}`}
					>
						{rank}
					</span>
				</div>

				{/* 用戶資訊 */}
				<div className='min-w-0 flex-1'>
					<div className='mb-1 flex items-center gap-2'>
						<span
							className={`font-semibold text-body ${
								isCurrentUser ? 'text-primary-700' : 'text-foreground-primary'
							}`}
						>
							{user.userName}
							{isCurrentUser && (
								<span className='ml-2 text-primary-600 text-xs'>(我)</span>
							)}
						</span>
					</div>
					<div className='text-foreground-muted text-xs'>
						本週碳排：{user.weeklyCO2.toFixed(2)} kg CO₂
					</div>
				</div>

				{/* 冠軍圖標 */}
				{isFirst && <Crown />}

				{/* 低於平均值的葉子圖標 */}
				{user.weeklyCO2 < 226 && <Leaf />}
			</div>
		)
	}

	// 處理排行榜顯示邏輯：所有用戶都在一個滾動區域中
	const processedLeaderboard = useMemo(() => {
		if (leaderboardData.length === 0) return { currentUser: null, allUsers: [] }

		const currentUser = leaderboardData.find((u) => u.isCurrentUser)
		if (!currentUser) {
			// 如果沒有使用者，返回所有用戶
			return { currentUser: null, allUsers: leaderboardData }
		}

		// 找到當前用戶的實際排名
		const currentUserActualRank =
			leaderboardData.findIndex((u) => u.isCurrentUser) + 1

		// 獲取所有用戶（包含使用者）
		const allUsers = leaderboardData

		return {
			currentUser: { ...currentUser, actualRank: currentUserActualRank },
			allUsers,
		}
	}, [leaderboardData])

	// 輔助函數
	const getCategoryIconElement = (
		categoryValue: string,
		size: 'sm' | 'md' | 'lg' = 'md',
	) => {
		const category = CARBON_CATEGORIES.find((c) => c.value === categoryValue)
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
					className={`${sizeClasses[size]} object-contain`}
				/>
			)
		}

		const emojiSizes = {
			sm: 'text-base',
			md: 'text-lg',
			lg: 'text-xl',
		}
		return <span className={emojiSizes[size]}>{category.icon}</span>
	}

	const getCategoryLabel = (categoryValue: string) => {
		return (
			CARBON_CATEGORIES.find((c) => c.value === categoryValue)?.label ||
			categoryValue
		)
	}

	const getCategoryColor = (categoryValue: string) => {
		return (
			CARBON_CATEGORIES.find((c) => c.value === categoryValue)?.color ||
			'bg-grey-100 text-grey-700'
		)
	}

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: checked,
		}))
	}

	// 隱藏帳號中間部分
	const maskAccount = (account: string) => {
		if (account.length <= 4) return account
		const start = account.slice(0, 2)
		const end = account.slice(-2)
		return `${start}${'*'.repeat(account.length - 4)}${end}`
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setIsSubmitting(true)
		setSubmitMessage({ type: null, text: '' })

		try {
			// TODO: 實作 API 呼叫來儲存個人資料
			// const response = await fetch('/api/profile', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify(formData),
			// })

			// 模擬 API 呼叫
			await new Promise((resolve) => setTimeout(resolve, 1000))

			setSubmitMessage({
				type: 'success',
				text: '個人資料已成功儲存',
			})
		} catch (error) {
			setSubmitMessage({
				type: 'error',
				text: '儲存失敗，請稍後再試',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	// 格式化生日顯示
	const formatBirthday = (birthday: Date) => {
		return birthday.toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
	}

	return (
		<main className='min-h-screen bg-background-muted px-3 py-4'>
			<div className='mx-auto max-w-sm'>
				{/* 標題區域 */}
				<div className='mb-6'>
					<h1 className='mb-1 text-foreground-primary text-h1'>個人資料</h1>
				</div>

				{/* 使用者資訊區塊 */}
				<div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
					{isLoadingProfile ? (
						<div className='py-4 text-center text-body text-foreground-muted'>
							載入中...
						</div>
					) : user ? (
						<div className='space-y-3'>
							<div className='flex items-center gap-3'>
								<div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary-100'>
									<img
										src='/icons/user.svg'
										alt='使用者頭像'
										className='h-6 w-6 text-primary-600'
									/>
								</div>
								<div className='flex-1'>
									<div className='mb-1 font-semibold text-body text-foreground-primary'>
										{user.realName}
									</div>
									<div className='text-caption text-foreground-muted'>
										{formatBirthday(user.birthday)}
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className='py-4 text-center text-body text-foreground-muted'>
							尚未設定個人資料
						</div>
					)}
				</div>

				{/* 表單 */}
				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* 發票帳戶資訊區塊 */}
					<div className='rounded-lg bg-white p-4 shadow-sm'>
						<h2 className='mb-4 text-foreground-primary text-h3'>
							統一發票帳戶資訊
						</h2>

						{isLoadingAccount ? (
							<div className='py-4 text-center text-body text-foreground-muted'>
								載入中...
							</div>
						) : invoiceAccount?.invoiceAccount ? (
							<div className='space-y-3'>
								<div className='rounded-lg border border-grey-200 bg-grey-50 p-3'>
									<div className='mb-1 text-foreground-muted text-xs'>
										發票帳號
									</div>
									<div className='font-semibold text-body text-foreground-primary'>
										{maskAccount(invoiceAccount.invoiceAccount)}
									</div>
								</div>
								<Link
									href='/profile/invoice/edit'
									className='flex w-full items-center justify-center rounded-lg border-2 border-grey-300 border-solid bg-white px-4 py-3 font-semibold text-body text-foreground-primary transition-colors hover:border-primary-500 hover:bg-primary-50'
								>
									編輯發票資訊
								</Link>
							</div>
						) : (
							<div className='space-y-3'>
								<div className='rounded-lg border border-grey-200 bg-grey-50 p-3 text-center'>
									<div className='text-body text-foreground-muted'>
										請編輯發票資訊
									</div>
								</div>
								<Link
									href='/profile/invoice/edit'
									className='flex w-full items-center justify-center rounded-lg border-2 border-grey-300 border-solid bg-white px-4 py-3 font-semibold text-body text-foreground-primary transition-colors hover:border-primary-500 hover:bg-primary-50'
								>
									編輯發票資訊
								</Link>
							</div>
						)}
					</div>
				</form>

				{/* 成就/排行榜區塊 */}
				<div className='mt-6 rounded-lg bg-white p-4 shadow-sm'>
					<div className='mb-4 flex justify-center'>
						<div className='flex w-full gap-2'>
							<button
								type='button'
								onClick={() => setShowLeaderboard(false)}
								className={`flex-1 rounded-lg px-6 py-2.5 font-semibold text-body transition-colors ${
									!showLeaderboard
										? 'bg-primary-500 text-white'
										: 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
								}`}
							>
								成就
							</button>
							<button
								type='button'
								onClick={() => setShowLeaderboard(true)}
								className={`flex-1 rounded-lg px-6 py-2.5 font-semibold text-body transition-colors ${
									showLeaderboard
										? 'bg-primary-500 text-white'
										: 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
								}`}
							>
								排行榜
							</button>
						</div>
					</div>

					{showLeaderboard ? (
						<div className='space-y-3'>
							<>
								{/* 最上方固定顯示使用者 */}
								{processedLeaderboard.currentUser && (
									<LeaderboardUserCard
										user={processedLeaderboard.currentUser}
										rank={processedLeaderboard.currentUser.actualRank}
										isCurrentUser={true}
									/>
								)}

								{/* 可滾動區域：包含所有用戶（包含使用者） */}
								<div
									ref={scrollContainerRef}
									className='max-h-[272px] space-y-2 overflow-y-auto'
								>
									{processedLeaderboard.allUsers.map((user) => {
										const rank =
											leaderboardData.findIndex(
												(u) => u.userId === user.userId,
											) + 1
										return (
											<LeaderboardUserCard
												key={user.userId}
												user={user}
												rank={rank}
												isCurrentUser={user.isCurrentUser}
											/>
										)
									})}
								</div>
							</>
						</div>
					) : (
						<>
							{achievements.length === 0 ? (
								<div className='py-4 text-center text-body text-foreground-muted'>
									尚無成就
								</div>
							) : (
								<>
									{/* 成就進度 */}
									<div className='mb-4 rounded-lg border border-grey-200 bg-grey-50 p-3'>
										<div className='mb-2 flex items-center justify-between'>
											<span className='font-semibold text-body text-foreground-primary'>
												成就進度
											</span>
											<span className='font-semibold text-body text-primary-600'>
												{achievements.filter((a) => a.unlocked).length} /{' '}
												{achievements.length}
											</span>
										</div>
										<div className='h-2 w-full overflow-hidden rounded-full bg-grey-200'>
											<div
												className='h-full rounded-full bg-primary-500 transition-all'
												style={{
													width: `${
														(achievements.filter((a) => a.unlocked).length /
															achievements.length) *
														100
													}%`,
												}}
											/>
										</div>
									</div>

									{/* 成就列表 - 捲軸顯示，一次顯示最少四個成就 */}
									<div className='max-h-[272px] space-y-2 overflow-y-auto'>
										{achievements.map((achievement) => (
											<div
												key={achievement.id}
												className={`flex items-center gap-3 rounded-lg border p-3 ${
													achievement.unlocked
														? 'border-primary-300 bg-primary-50'
														: 'border-grey-200 bg-grey-50 opacity-60'
												}`}
											>
												<div className='shrink-0'>
													<img
														src={
															achievement.unlocked
																? '/icons/complete.svg'
																: '/icons/incomplete.svg'
														}
														alt={achievement.unlocked ? '已完成' : '未完成'}
														className='h-6 w-6'
													/>
												</div>
												<div className='min-w-0 flex-1'>
													<div className='mb-1 font-semibold text-body text-foreground-primary'>
														{achievement.title}
													</div>
													<div className='text-caption text-foreground-muted'>
														{achievement.description}
													</div>
													{achievement.unlocked && achievement.unlockedAt && (
														<div className='mt-1 text-caption text-foreground-muted'>
															{new Date(
																achievement.unlockedAt,
															).toLocaleDateString('zh-TW')}
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								</>
							)}
						</>
					)}
				</div>

				{/* 最近紀錄區塊 */}
				<div className='mt-6 rounded-lg bg-white p-4 shadow-sm'>
					<div className='mb-3 flex items-center justify-between'>
						<h2 className='font-semibold text-foreground-primary text-lg'>
							最近紀錄
						</h2>
						<div className='flex items-center gap-2'>
							{loading && (
								<div className='text-foreground-muted text-xs'>載入中...</div>
							)}
							{!loading && hasMoreRecords && (
								<Link
									href='/records'
									className='rounded-lg bg-primary-600 px-4 py-1.5 font-semibold text-white text-xs transition-colors hover:bg-primary-700'
								>
									查看全部 ({sortedRecords.length})
								</Link>
							)}
						</div>
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
						<>
							<div className='space-y-2.5'>
								{recentRecords.map((record) => {
									return (
										<div
											key={record.id}
											className='rounded-lg border border-grey-200 bg-white p-3 transition-colors hover:bg-grey-50'
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
																record.category,
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
														<span>
															{new Date(record.date).toLocaleDateString(
																'zh-TW',
															)}
														</span>
													</div>
												</div>
												<div className='font-semibold text-base text-primary-600'>
													{record.totalCO2.toFixed(2)} kg CO₂
												</div>
											</div>
										</div>
									)
								})}
							</div>
						</>
					)}
				</div>
			</div>
		</main>
	)
}
