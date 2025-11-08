'use client'

import { useCallback, useEffect, useRef } from 'react'

import {
	type FaceOnKeyboardHealth,
	faceOnKeyboardHealthSchema,
} from '@/lib/schemas'

import { useMessage } from '../hooks/use-message'

export type { FaceOnKeyboardHealth }

/**
 * Hook that requests health metrics from the native face_on_keyboard bridge.
 * It issues a request once on mount (configurable) and exposes the latest
 * payload together with loading and error states.
 */
export function useHealth({ autoFetch = true }: { autoFetch?: boolean } = {}) {
	const { data, error, loading, send } = useMessage<FaceOnKeyboardHealth>({
		name: 'face_on_keyboard_health',
		validator: faceOnKeyboardHealthSchema,
	})

	const hasRequested = useRef(false)

	useEffect(() => {
		if (!autoFetch || hasRequested.current) return
		hasRequested.current = true
		console.log('[useHealth] requesting face_on_keyboard_health (autoFetch)')
		send({ data: {} })
	}, [autoFetch, send])

	useEffect(() => {
		if (data) {
			console.log('[useHealth] received face_on_keyboard_health', data)
		}
	}, [data])

	useEffect(() => {
		if (error) {
			console.error('[useHealth] face_on_keyboard_health error', error)
		}
	}, [error])

	const refetch = useCallback(() => {
		console.log('[useHealth] refetch face_on_keyboard_health')
		send({ data: {} })
	}, [send])

	return {
		health: data,
		loading,
		error,
		refetch,
	}
}
