'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function InvoiceEditPage() {
  const [formData, setFormData] = useState({
    invoiceAccount: '',
    invoicePassword: '',
  })

  // 載入已儲存的發票帳戶資訊
  useEffect(() => {
    const storedAccount = localStorage.getItem('invoiceAccount')
    if (storedAccount) {
      try {
        const account = JSON.parse(storedAccount)
        setFormData((prev) => ({
          ...prev,
          invoiceAccount: account.invoiceAccount || '',
          // 不載入密碼，需要重新輸入
        }))
      } catch (error) {
        console.error('Failed to parse invoice account:', error)
      }
    }
  }, [])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error' | null
    text: string
  }>({ type: null, text: '' })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage({ type: null, text: '' })

    try {
      // TODO: 實作 API 呼叫來儲存發票資訊
      // const response = await fetch('/api/profile/invoice', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // 模擬 API 呼叫
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 儲存到 localStorage（前端暫存，實際應儲存到後端）
      localStorage.setItem('invoiceAccount', JSON.stringify(formData))
      
      // 觸發自定義事件，通知其他頁面更新
      window.dispatchEvent(new Event('invoiceAccountUpdated'))

      setSubmitMessage({
        type: 'success',
        text: '發票資訊已成功儲存',
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
          <Link
            href='/profile'
            className='mb-4 inline-flex items-center text-xs text-primary-600 hover:text-primary-700'
          >
            ← 返回個人資料
          </Link>
          <h1 className='mb-1 text-h1 text-foreground-primary'>編輯發票資訊</h1>
        </div>

        {/* 表單 */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* 發票帳戶資訊區塊 */}
          <div className='rounded-lg bg-white p-4 shadow-sm'>
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

