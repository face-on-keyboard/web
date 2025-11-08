'use client'

import { stringToJSONSchema } from '@/lib/zod'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type ZodType, z } from 'zod/v4'

export function useMessage<T>({
	name,
	validator,
	onMessage,
	onError,
	sendOnLoad = false,
}: {
	name: string
	validator: ZodType<T>
	onMessage?: (data: T) => void
	onError?: (error: unknown) => void
	sendOnLoad?: boolean | unknown
}) {
	const [data, setData] = useState<T>()
	const [error, setError] = useState<unknown>()
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		// `flutterObject` is defined by the townpass app
		// @ts-ignore
		if (typeof flutterObject !== 'undefined' && flutterObject) {
			// @ts-ignore
			flutterObject.addEventListener('message', (e) => {
				const flutterEventSchema = z.object({
					data: stringToJSONSchema.pipe(
						z.object({
							name: z.string(),
							data: z.any(),
						}),
					),
				})

				const validatedEventData = flutterEventSchema.safeParse(e)

				if (validatedEventData.error) {
					setError(validatedEventData.error)
					return
				}

				if (validatedEventData.data.data.name !== name) return

				setLoading(false)

				const validatedReturnData = validator.safeParse(
					validatedEventData.data.data.data,
				)

				if (validatedReturnData.error) {
					setError(validatedReturnData.error)
					return
				}

				setData(validatedReturnData.data)
			})
		}
	}, [name, validator])

	const onMessageRef = useRef(onMessage)
	const onErrorRef = useRef(onError)

	useEffect(() => {
		onMessageRef.current = onMessage
	}, [onMessage])

	useEffect(() => {
		onErrorRef.current = onError
	}, [onError])

	useEffect(() => {
		if (onMessageRef.current && data) {
			onMessageRef.current(data)
		}
	}, [data])

	useEffect(() => {
		if (onErrorRef.current && error) {
			onErrorRef.current(error)
		}
	}, [error])

	useEffect(() => {
		if (sendOnLoad) {
			if (typeof sendOnLoad === 'boolean') send()
			else send(sendOnLoad)
		}
	}, [sendOnLoad])

	const send = useCallback(
		<T>(payload?: { data?: T }) => {
			// @ts-ignore
			if (typeof flutterObject !== 'undefined' && flutterObject) {
				const body = JSON.stringify({ name, data: payload?.data })

				setLoading(true)

				// @ts-ignore
				flutterObject.postMessage(body)
			}
		},
		[name],
	)

	return {
		data,
		error,
		loading,
		send,
	}
}
