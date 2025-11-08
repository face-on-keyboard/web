'use client'

import { useState, useEffect } from 'react'
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
      setUserProfile({
        name: '使用者',
        birthday: new Date().toISOString().split('T')[0],
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
              {/* 排行榜內容 */}
              <div className='rounded-lg border border-grey-200 bg-grey-50 p-3'>
                <div className='text-center text-body text-foreground-muted'>
                  排行榜功能開發中
                </div>
              </div>
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

                  {/* 成就列表 */}
                  <div className='max-h-96 space-y-3 overflow-y-auto'>
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
      </div>
    </main>
  )
}

