'use client'

import { z } from 'zod/v4'
import { useMessage } from '../hooks/use-message'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from './client'
import { useLocalStorage } from 'usehooks-ts'
import { useEffect } from 'react'
import { locationSchema } from '@/lib/schemas'

const useSegments = () =>
  useQuery({
    queryKey: ['segments'],
    queryFn: async () => {
      const response = await api.api.segments.$get()

      if (!response.ok) {
        throw new Error('Failed to fetch segments')
      }

      return (await response.json()).data
    },
  })

const useCreateSegment = () =>
  useMutation({
    mutationKey: ['create-segment'],
    mutationFn: async (segment: z.infer<typeof locationSchema>) => {
      const response = await api.api.segments.$put({ json: segment })

      if (!response.ok) {
        throw new Error('Failed to create segment')
      }

      return await response.json()
    },
  })

export function useLocation() {
  const { data: segments, isLoading, refetch } = useSegments()
  const { mutate: create, isPending } = useCreateSegment()
  const [lastUpdatedAt, setLastUpdatedAt] = useLocalStorage<number>(
    'face_on_keyboard_location_last_updated_at',
    0
  )

  const { data } = useMessage({
    name: 'face_on_keyboard_location',
    validator: z.object({
      segments: z.array(locationSchema),
    }),
    sendOnLoad: {
      clear_after_fetch: true,
    },
  })

  useEffect(() => {
    // Update every 5 minutes
    if (new Date().getTime() - lastUpdatedAt >= 1000 * 60 * 5) {
      for (const segment of data?.segments || []) {
        create(segment, {
          onSuccess: () => setLastUpdatedAt(new Date().getTime()),
        })
      }

      refetch()
    }
  }, [data, lastUpdatedAt, create, refetch, setLastUpdatedAt])

  return { segments, isLoading, isCreating: isPending }
}
