'use client'

import { stringToJSONSchema } from '@/lib/zod'
import { useEffect, useState } from 'react'
import { z, type ZodType } from 'zod/v4'

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
  sendOnLoad?: boolean
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
            })
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
          validatedEventData.data.data.data
        )

        if (validatedReturnData.error) {
          setError(validatedReturnData.error)
          return
        }

        setData(validatedReturnData.data)
      })
    }
  }, [name, validator])

  useEffect(() => {
    if (onMessage && data) {
      onMessage(data)
    }
  }, [data, onMessage])

  useEffect(() => {
    if (onError && error) {
      onError(error)
    }
  }, [error, onError])

  useEffect(() => {
    if (sendOnLoad) {
      send()
    }
  }, [sendOnLoad])

  function send<T>(payload?: { data?: T }) {
    // @ts-ignore
    if (typeof flutterObject !== 'undefined' && flutterObject) {
      const body = JSON.stringify({ name, data: payload?.data })

      setLoading(true)

      // @ts-ignore
      flutterObject.postMessage(body)
    }
  }

  return {
    data,
    error,
    loading,
    send,
  }
}
