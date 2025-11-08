'use client'

import { z } from 'zod/v4'
import { useMessage } from '../hooks/use-message'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from './client'
import { useCallback, useEffect, useRef } from 'react'
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
  const hasInitialized = useRef(false)

  const handleMessage = useCallback(
    (data: { segments: z.infer<typeof locationSchema>[] }) => {
      for (const segment of data.segments) {
        create(segment)
      }

      refetch()
    },
    [create, refetch]
  )

  const { send } = useMessage({
    name: 'face_on_keyboard_location',
    validator: z.object({
      segments: z.array(locationSchema),
    }),
    onMessage: handleMessage,
  })

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      send({
        data: { clear_after_fetch: true },
      })
    }
  }, [send])

  return { segments, isLoading, isCreating: isPending }
}
