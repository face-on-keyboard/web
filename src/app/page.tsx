'use client'

import { useMessage } from '@/components/hooks/use-message'
import { z } from 'zod/v4'

export default function HomePage() {
  const requestPayload = {
    // log: true, // 選填：要不要在 console 印 debug info
    clear_after_fetch: false, // 選填：取完要不要清掉 SharedPreferences
    update_config: {              // 選填：調整追蹤參數
      segment_duration_minutes: 1,
      speed_threshold_mps: 0,
      distance_filter_meters: 0
    }
  }

  const { data, error, loading, send } = useMessage({
    name: 'face_on_keyboard_location',
    payload: requestPayload,
    validator: z.object({
      segments: z.array(
        z.object({
          start_x: z.number(),
          start_y: z.number(),
          start_time: z.string(),
          end_x: z.number(),
          end_y: z.number(),
          end_time: z.string(),
        })
      ),
    }),
    //sendOnLoad: true,
  })

  const handleSend = () => {
    send(requestPayload)
  }

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
      <button
        type='button'
        className='mt-4 rounded bg-primary px-4 py-2 text-white transition hover:bg-primary/90 aria-disabled:cursor-not-allowed aria-disabled:opacity-70'
        onClick={handleSend}
        aria-disabled={loading}
      >
        {loading ? 'Sending…' : 'Send Location Request'}
      </button>
    </main>
  )
}
