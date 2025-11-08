'use client'

import { useEffect, useState } from 'react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [formData, setFormData] = useState({
    invoiceAccount: '',
    invoicePassword: '',
    carbonLimit: '226',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 每次打開彈出視窗時重置表單
  useEffect(() => {
    if (isOpen) {
      setFormData({
        invoiceAccount: '',
        invoicePassword: '',
        carbonLimit: '226',
      })
    }
  }, [isOpen])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (typeof window !== 'undefined') {
        // 儲存發票帳戶資訊
        localStorage.setItem(
          'invoiceAccount',
          JSON.stringify({
            invoiceAccount: formData.invoiceAccount,
            invoicePassword: formData.invoicePassword,
          })
        )

        // 儲存減碳目標
        localStorage.setItem('carbonLimit', formData.carbonLimit)

        // 標記 onboarding 已完成
        localStorage.setItem('onboardingCompleted', 'true')

        // 觸發自定義事件，通知其他頁面更新
        window.dispatchEvent(new Event('invoiceAccountUpdated'))
        window.dispatchEvent(new Event('carbonLimitUpdated'))
      }

      // 關閉彈出視窗
      onClose()
    } catch (error) {
      console.error('Failed to save onboarding data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='w-full max-w-md rounded-lg bg-white p-6 shadow-lg'>
        <h2 className='mb-4 text-foreground-primary text-xl font-semibold'>
          歡迎使用減碳 Dashboard
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* 發票帳號 */}
          <div>
            <label
              htmlFor='invoiceAccount'
              className='mb-2 block text-foreground-primary text-sm font-medium'
            >
              發票帳號
            </label>
            <input
              type='text'
              id='invoiceAccount'
              name='invoiceAccount'
              value={formData.invoiceAccount}
              onChange={handleInputChange}
              placeholder='請輸入您的統一發票帳號'
              className='w-full rounded-lg border border-grey-300 px-3 py-2 text-body text-foreground-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'
              required
            />
          </div>

          {/* 發票密碼 */}
          <div>
            <label
              htmlFor='invoicePassword'
              className='mb-2 block text-foreground-primary text-sm font-medium'
            >
              發票密碼
            </label>
            <input
              type='password'
              id='invoicePassword'
              name='invoicePassword'
              value={formData.invoicePassword}
              onChange={handleInputChange}
              placeholder='請輸入您的統一發票密碼'
              className='w-full rounded-lg border border-grey-300 px-3 py-2 text-body text-foreground-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'
              required
            />
          </div>

          {/* 減碳目標 */}
          <div>
            <label
              htmlFor='carbonLimit'
              className='mb-2 block text-foreground-primary text-sm font-medium'
            >
              設定減碳目標（每週 kg CO₂）
            </label>
            <input
              type='number'
              id='carbonLimit'
              name='carbonLimit'
              value={formData.carbonLimit}
              onChange={handleInputChange}
              placeholder='226'
              min='0'
              step='0.1'
              className='w-full rounded-lg border border-grey-300 px-3 py-2 text-body text-foreground-primary focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'
              required
            />
            <p className='mt-2 text-foreground-muted text-xs'>
              台灣平均一週碳排量是 226 kg
            </p>
          </div>

          {/* 按鈕 */}
          <div className='flex gap-3 pt-2'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 rounded-lg bg-primary-500 px-4 py-2.5 font-semibold text-white text-body transition-colors hover:bg-primary-600 disabled:bg-grey-300 disabled:cursor-not-allowed'
            >
              {isSubmitting ? '儲存中...' : '完成設定'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

