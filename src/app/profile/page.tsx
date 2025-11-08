'use client'

import { useState } from 'react'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    invoiceAccount: '',
    invoicePassword: '',
    agreeHealthData: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
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

  return (
    <main className='min-h-screen bg-background-muted py-4 px-3'>
      <div className='mx-auto max-w-sm'>
        {/* 標題區域 */}
        <div className='mb-6'>
          <h1 className='mb-1 text-h1 text-foreground-primary'>個人資料</h1>
          <p className='text-body text-foreground-secondary'>
            設定您的發票帳戶資訊與資料使用權限
          </p>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* 發票帳戶資訊區塊 */}
          <div className='rounded-lg bg-white p-4 shadow-sm'>
            <h2 className='mb-4 text-h3 text-foreground-primary'>
              統一發票帳戶資訊
            </h2>

            <div className='space-y-4'>
              {/* 發票帳號 */}
              <div>
                <label
                  htmlFor='invoiceAccount'
                  className='mb-1.5 block text-body font-semibold text-foreground-primary'
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
                  className='w-full rounded-lg border border-grey-300 bg-white px-3 py-2.5 text-body text-foreground-primary placeholder:text-foreground-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'
                  required
                />
              </div>

              {/* 發票密碼 */}
              <div>
                <label
                  htmlFor='invoicePassword'
                  className='mb-1.5 block text-body font-semibold text-foreground-primary'
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
                  className='w-full rounded-lg border border-grey-300 bg-white px-3 py-2.5 text-body text-foreground-primary placeholder:text-foreground-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200'
                  required
                />
              </div>
            </div>
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

          {/* 提交訊息 */}
          {submitMessage.type && (
            <div
              className={`rounded-lg border p-3 text-body ${
                submitMessage.type === 'success'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-red-300 bg-red-50 text-red-600'
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          {/* 提交按鈕 */}
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-lg bg-primary-500 px-4 py-3 text-body font-semibold text-white transition-colors hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:bg-disabled disabled:text-foreground-muted'
          >
            {isSubmitting ? '儲存中...' : '儲存設定'}
          </button>
        </form>
      </div>
    </main>
  )
}

