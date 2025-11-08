'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'

interface InvoiceAccount {
  invoiceAccount: string
  invoicePassword?: string
}

interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
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

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    agreeHealthData: false,
  })
  const [invoiceAccount, setInvoiceAccount] = useState<InvoiceAccount | null>(null)
  const [isLoadingAccount, setIsLoadingAccount] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })

  // 最近紀錄相關狀態
  const [records, setRecords] = useState<CarbonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set())

  // 排行榜數據
  const [leaderboardData, setLeaderboardData] = useState<Array<{
    userId: string
    userName: string
    weeklyCO2: number
    isCurrentUser: boolean
  }>>([])
  
  // 滾動相關狀態
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const leaderboardDataRef = useRef(leaderboardData)

  // 載入使用者資料
  useEffect(() => {
    // 從 localStorage 讀取（前端暫存，實際應從 API 獲取）
    const storedProfile = localStorage.getItem('userProfile')
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile))
      } catch (error) {
        console.error('Failed to parse user profile:', error)
      }
    } else {
      // 如果沒有資料，使用預設值（實際應從 API 獲取）
      const today = new Date().toISOString().split('T')[0]
      setUserProfile({
        name: '使用者',
        birthday: today || new Date().toISOString().substring(0, 10),
      })
    }
    setIsLoadingProfile(false)
  }, [])

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

  // 載入成就資料
  useEffect(() => {
    // TODO: 從 API 獲取成就資料
    // 目前使用模擬資料
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        title: '減碳新手',
        description: '完成第一次碳排放記錄',
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '環保達人',
        description: '累積減碳超過 100kg',
        unlocked: false,
      },
      {
        id: '3',
        title: '連續記錄',
        description: '連續記錄 7 天',
        unlocked: false,
      },
      {
        id: '4',
        title: '發票大師',
        description: '記錄超過 50 筆發票',
        unlocked: false,
      },
      {
        id: '5',
        title: '綠色生活',
        description: '一個月內減碳超過 50kg',
        unlocked: false,
      },
      {
        id: '6',
        title: '記錄達人',
        description: '累積記錄超過 100 筆',
        unlocked: false,
      },
      {
        id: '7',
        title: '環保先鋒',
        description: '連續 30 天記錄碳排放',
        unlocked: false,
      },
      {
        id: '8',
        title: '減碳專家',
        description: '累積減碳超過 500kg',
        unlocked: false,
      },
      {
        id: '9',
        title: '分類大師',
        description: '使用所有類別記錄',
        unlocked: false,
      },
      {
        id: '10',
        title: '月度冠軍',
        description: '單月減碳量最高',
        unlocked: false,
      },
      {
        id: '11',
        title: '節能之星',
        description: '連續 14 天記錄',
        unlocked: false,
      },
      {
        id: '12',
        title: '環保大使',
        description: '累積減碳超過 1000kg',
        unlocked: false,
      },
    ]
    setAchievements(mockAchievements)
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

  // 數據獲取函數
  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/invoices')
      
      if (!response.ok) {
        throw new Error('無法獲取統一發票數據')
      }
      
      const data = await response.json()
      setRecords(data.records || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生未知錯誤')
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  // useEffect 來載入數據
  useEffect(() => {
    fetchInvoices()
  }, [])

  // 展開/收合功能
  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
      } else {
        newSet.add(recordId)
      }
      return newSet
    })
  }

  // 排序和過濾邏輯
  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  }, [records])

  // 只顯示最近三筆
  const recentRecords = sortedRecords.slice(0, 3)
  const hasMoreRecords = sortedRecords.length > 3

  // 計算本週總碳排量
  const calculateWeeklyCO2 = useMemo(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = 星期日, 1 = 星期一, ...
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek) // 設定為本週第一天（星期日）
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // 本週最後一天
    endOfWeek.setHours(23, 59, 59, 999)
    
    const formatDate = (date: Date): string => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const startStr = formatDate(startOfWeek)
    const endStr = formatDate(endOfWeek)
    
    return records
      .filter(record => {
        const recordDate = record.date
        return recordDate >= startStr && recordDate <= endStr
      })
      .reduce((sum, record) => sum + record.totalCO2, 0)
  }, [records])

  // 載入排行榜數據
  useEffect(() => {
    // TODO: 從 API 獲取排行榜數據
    // 目前使用模擬數據
    const currentUserName = userProfile?.name || '使用者'
    const mockLeaderboard: Array<{
      userId: string
      userName: string
      weeklyCO2: number
      isCurrentUser: boolean
    }> = [
      {
        userId: 'user1',
        userName: 'Eco Master',
        weeklyCO2: 5.2,
        isCurrentUser: false,
      },
      {
        userId: 'user2',
        userName: currentUserName,
        // 如果計算出的碳排量為0，使用一個測試值；否則使用實際計算值
        weeklyCO2: calculateWeeklyCO2 > 0 ? calculateWeeklyCO2 : 150.5,
        isCurrentUser: true,
      },
      {
        userId: 'user3',
        userName: 'Green Lifer',
        weeklyCO2: 8.5,
        isCurrentUser: false,
      },
      {
        userId: 'user4',
        userName: 'Carbon Pioneer',
        weeklyCO2: 12.3,
        isCurrentUser: false,
      },
      {
        userId: 'user5',
        userName: 'Eco Angel',
        weeklyCO2: 15.8,
        isCurrentUser: false,
      },
      {
        userId: 'user6',
        userName: 'Energy Expert',
        weeklyCO2: 18.6,
        isCurrentUser: false,
      },
      {
        userId: 'user7',
        userName: 'Low Carbon Lifer',
        weeklyCO2: 700,
        isCurrentUser: false,
      },
      {
        userId: 'user8',
        userName: 'Eco Beginner',
        weeklyCO2: 800,
        isCurrentUser: false,
      },
      {
        userId: 'user9',
        userName: 'Carbon Newbie',
        weeklyCO2: 305,
        isCurrentUser: false,
      },
      {
        userId: 'user10',
        userName: 'Just Started',
        weeklyCO2: 352,
        isCurrentUser: false,
      },
      {
        userId: 'user11',
        userName: 'Learning',
        weeklyCO2: 408,
        isCurrentUser: false,
      },
      {
        userId: 'user12',
        userName: 'New Member',
        weeklyCO2: 456,
        isCurrentUser: false,
      },
    ]
    
    // 按總碳排量排序（最低的在前）
    const sorted = mockLeaderboard.sort((a, b) => a.weeklyCO2 - b.weeklyCO2)
    setLeaderboardData(sorted)
  }, [calculateWeeklyCO2, userProfile?.name])

  // 排行榜用戶卡片元件
  const LeaderboardUserCard = ({ 
    user, 
    rank, 
    isCurrentUser = false 
  }: { 
    user: { userId: string; userName: string; weeklyCO2: number }
    rank: number
    isCurrentUser?: boolean
  }) => {
    const isFirst = rank === 1
    
    return (
      <div className={`flex items-center gap-3 rounded-lg border p-3 ${
        isCurrentUser 
          ? 'border-primary-500 bg-primary-50 shadow-md' 
          : 'border-grey-200 bg-white'
      }`}>
        {/* 排名 */}
        <div className='flex w-8 items-center justify-center'>
          <span className={`text-lg font-bold ${
            isFirst && !isCurrentUser ? 'text-primary-600' : 'text-foreground-muted'
          }`}>
            {rank}
          </span>
        </div>
        
        {/* 用戶資訊 */}
        <div className='flex-1 min-w-0'>
          <div className='mb-1 flex items-center gap-2'>
            <span className={`text-body font-semibold ${
              isCurrentUser ? 'text-primary-700' : 'text-foreground-primary'
            }`}>
              {user.userName}
              {isCurrentUser && (
                <span className='ml-2 text-xs text-primary-600'>(我)</span>
              )}
            </span>
          </div>
          <div className='text-xs text-foreground-muted'>
            本週碳排：{user.weeklyCO2.toFixed(2)} kg CO₂
          </div>
        </div>
        
        {/* 冠軍圖標 */}
        {isFirst && (
          <div className='flex-shrink-0'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-6 w-6 text-primary-600'
            >
              <path d='M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978'/>
              <path d='M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978'/>
              <path d='M18 9h1.5a1 1 0 0 0 0-5H18'/>
              <path d='M4 22h16'/>
              <path d='M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z'/>
              <path d='M6 9H4.5a1 1 0 0 1 0-5H6'/>
            </svg>
          </div>
        )}
        
        {/* 低於平均值的葉子圖標 */}
        {user.weeklyCO2 < 226 && (
          <div className='flex-shrink-0'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-6 w-6 text-green-600'
            >
              <path d='M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z'/>
              <path d='M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'/>
            </svg>
          </div>
        )}
      </div>
    )
  }

  // 處理排行榜顯示邏輯：所有用戶都在一個滾動區域中
  const processedLeaderboard = useMemo(() => {
    if (leaderboardData.length === 0) return { currentUser: null, allUsers: [] }
    
    const currentUser = leaderboardData.find(u => u.isCurrentUser)
    if (!currentUser) {
      // 如果沒有使用者，返回所有用戶
      return { currentUser: null, allUsers: leaderboardData }
    }
    
    // 找到當前用戶的實際排名
    const currentUserActualRank = leaderboardData.findIndex(u => u.isCurrentUser) + 1
    
    // 獲取所有用戶（包含使用者）
    const allUsers = leaderboardData
    
    return {
      currentUser: { ...currentUser, actualRank: currentUserActualRank },
      allUsers,
    }
  }, [leaderboardData])
  
  

  // 輔助函數
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
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.label || categoryValue
  }

  const getCategoryColor = (categoryValue: string) => {
    return CARBON_CATEGORIES.find(c => c.value === categoryValue)?.color || 'bg-grey-100 text-grey-700'
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
  const formatBirthday = (birthday: string) => {
    if (!birthday) return ''
    const date = new Date(birthday)
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <main className='min-h-screen bg-background-muted py-4 px-3'>
      <div className='mx-auto max-w-sm'>
        {/* 標題區域 */}
        <div className='mb-6'>
          <h1 className='mb-1 text-h1 text-foreground-primary'>個人資料</h1>
        </div>

        {/* 使用者資訊區塊 */}
        <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
          {isLoadingProfile ? (
            <div className='py-4 text-center text-body text-foreground-muted'>
              載入中...
            </div>
          ) : userProfile ? (
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
                  <div className='mb-1 text-body font-semibold text-foreground-primary'>
                    {userProfile.name}
                  </div>
                  <div className='text-caption text-foreground-muted'>
                    {formatBirthday(userProfile.birthday)}
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
            <h2 className='mb-4 text-h3 text-foreground-primary'>
              統一發票帳戶資訊
            </h2>

            {isLoadingAccount ? (
              <div className='py-4 text-center text-body text-foreground-muted'>
                載入中...
              </div>
            ) : invoiceAccount?.invoiceAccount ? (
              <div className='space-y-3'>
                <div className='rounded-lg border border-grey-200 bg-grey-50 p-3'>
                  <div className='mb-1 text-xs text-foreground-muted'>發票帳號</div>
                  <div className='text-body font-semibold text-foreground-primary'>
                    {maskAccount(invoiceAccount.invoiceAccount)}
                  </div>
                </div>
                <Link
                  href='/profile/invoice/edit'
                  className='flex w-full items-center justify-center rounded-lg border-2 border-solid border-grey-300 bg-white px-4 py-3 text-body font-semibold text-foreground-primary transition-colors hover:border-primary-500 hover:bg-primary-50'
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
                  className='flex w-full items-center justify-center rounded-lg border-2 border-solid border-grey-300 bg-white px-4 py-3 text-body font-semibold text-foreground-primary transition-colors hover:border-primary-500 hover:bg-primary-50'
                >
                  編輯發票資訊
                </Link>
              </div>
            )}
          </div>

          {/* 資料使用權限區塊 */}
          <div className='rounded-lg bg-white p-4 shadow-sm'>
            <h2 className='mb-4 text-h3 text-foreground-primary'>
              資料使用權限
            </h2>

            <div className='space-y-3'>
              <label className='flex items-start gap-3 cursor-pointer'>
                <input
                  type='checkbox'
                  name='agreeHealthData'
                  checked={formData.agreeHealthData}
                  onChange={handleInputChange}
                  className='mt-0.5 h-5 w-5 rounded border-grey-300 text-primary-500 focus:ring-2 focus:ring-primary-200 focus:ring-offset-0'
                />
                <div className='flex-1'>
                  <span className='block text-body font-semibold text-foreground-primary'>
                    同意抓取健康資料
                  </span>
                  <span className='mt-1 block text-caption text-foreground-secondary'>
                    允許應用程式存取您的健康相關資料，用於計算更精確的碳排放量
                  </span>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* 成就/排行榜區塊 */}
        <div className='mt-6 rounded-lg bg-white p-4 shadow-sm'>
          <div className='mb-4 flex justify-center'>
            <div className='flex w-full gap-2'>
              <button
                onClick={() => setShowLeaderboard(false)}
                className={`flex-1 rounded-lg px-6 py-2.5 text-body font-semibold transition-colors ${
                  !showLeaderboard
                    ? 'bg-primary-500 text-white'
                    : 'bg-grey-100 text-foreground-primary hover:bg-grey-200'
                }`}
              >
                成就
              </button>
              <button
                onClick={() => setShowLeaderboard(true)}
                className={`flex-1 rounded-lg px-6 py-2.5 text-body font-semibold transition-colors ${
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
                    const rank = leaderboardData.findIndex(u => u.userId === user.userId) + 1
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
                      <span className='text-body font-semibold text-foreground-primary'>
                        成就進度
                      </span>
                      <span className='text-body font-semibold text-primary-600'>
                        {achievements.filter(a => a.unlocked).length} / {achievements.length}
                      </span>
                    </div>
                    <div className='h-2 w-full overflow-hidden rounded-full bg-grey-200'>
                      <div
                        className='h-full rounded-full bg-primary-500 transition-all'
                        style={{
                          width: `${(achievements.filter(a => a.unlocked).length / achievements.length) * 100}%`,
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
                        <div className='flex-shrink-0'>
                          <img
                            src={achievement.unlocked ? '/icons/complete.svg' : '/icons/incomplete.svg'}
                            alt={achievement.unlocked ? '已完成' : '未完成'}
                            className='h-6 w-6'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='mb-1 text-body font-semibold text-foreground-primary'>
                            {achievement.title}
                          </div>
                          <div className='text-caption text-foreground-muted'>
                            {achievement.description}
                          </div>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <div className='mt-1 text-caption text-foreground-muted'>
                              {new Date(achievement.unlockedAt).toLocaleDateString('zh-TW')}
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
            <h2 className='text-lg font-semibold text-foreground-primary'>最近紀錄</h2>
            <div className='flex items-center gap-2'>
              {loading && (
                <div className='text-xs text-foreground-muted'>載入中...</div>
              )}
              {!loading && hasMoreRecords && (
                <Link
                  href='/records'
                  className='rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700'
                >
                  查看全部 ({sortedRecords.length})
                </Link>
              )}
            </div>
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
                  return (
                    <div
                      key={record.id}
                      className='rounded-lg border border-grey-200 bg-white p-3 transition-colors hover:bg-grey-50'
                    >
                      <div className='flex items-start gap-3'>
                        <div>
                          {getCategoryIconElement(record.category, 'lg')}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='mb-1.5 flex flex-wrap items-center gap-1.5'>
                            <span className='text-sm font-semibold text-foreground-primary break-words'>
                              {record.storeName}
                            </span>
                            <span className={`rounded-full px-1.5 py-0.5 text-xs ${getCategoryColor(record.category)}`}>
                              {getCategoryLabel(record.category)}
                            </span>
                          </div>
                          <div className='flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted'>
                            <span className='font-semibold text-foreground-primary'>
                              NT$ {record.totalAmount.toLocaleString()}
                            </span>
                            <span>·</span>
                            <span>{new Date(record.date).toLocaleDateString('zh-TW')}</span>
                          </div>
                        </div>
                        <div className='text-base font-semibold text-primary-600'>
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

