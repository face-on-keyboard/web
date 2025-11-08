'use client'

import { useMessage } from '@/components/hooks/use-message'
import { userInfoSchema } from '@/lib/events'
import { useEffect } from 'react'

export default function HomePage() {
  const {
    data: user,
    error,
    loading,
  } = useMessage({
    name: 'userinfo',
    validator: userInfoSchema,
    sendOnLoad: true,
  })

  return (
    <main className='flex min-h-screen flex-col items-center justify-center bg-background-muted text-black'>
      <h1 className='text-h1'>H1</h1>
      <h2 className='text-h2'>H2</h2>
      <h3 className='text-h3'>H3</h3>
      <p className='text-body'>Body</p>
      <p className='text-caption'>Cpation</p>
      {loading && 'Loading...'}
      <p className='max-w-[250px]'>{user?.realName ?? 'No Message'}</p>
      <p className='max-w-[250px]'>{JSON.stringify(error) ?? 'No Error'}</p>
    </main>
  )
}
