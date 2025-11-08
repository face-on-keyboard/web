'use client'

import { useMessage } from '@/components/hooks/use-message'
import { z } from 'zod/v4'

export default function HomePage() {
  const { data, error, loading } = useMessage({
    name: 'face_on_keyboard_location',
    validator: z.object({
      segments: z.array(
        z.object({
          start_x: z.number(),
          start_y: z.number(),
          start_time: z.date(),
          end_x: z.number(),
          end_y: z.number(),
          end_time: z.date(),
        })
      ),
    }),
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
      <p className='max-w-[250px]'>{JSON.stringify(data) ?? 'No Message'}</p>
      <p className='max-w-[250px]'>{JSON.stringify(error) ?? 'No Error'}</p>
    </main>
  )
}
