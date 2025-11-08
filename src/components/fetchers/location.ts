'use client'

import { locationSchema } from '@/lib/schemas'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'
import { z } from 'zod/v4'
import { useMessage } from '../hooks/use-message'
import { client } from './client'

const useSegments = () =>
	useQuery({
		queryKey: ['segments'],
		queryFn: async () => {
			const response = await client.api.segments.$get()

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
			const response = await client.api.segments.$put({ json: segment })

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
			console.log(
				'[useLocation] received face_on_keyboard_location',
				data?.segments?.length ?? 0,
				data,
			)
			for (const segment of data.segments) {
				create(segment)
			}

			refetch()
		},
		[create, refetch],
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
			console.log('[useLocation] requesting face_on_keyboard_location', {
				clear_after_fetch: true,
			})
			send({
				data: { clear_after_fetch: true },
			})
		}
	}, [send])

	return { segments, isLoading, isCreating: isPending }
}
