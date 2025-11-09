'use client'

import { useEffect, useState } from 'react'

export function useCountup(targetNumber: number, duration = 1000) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const startTime = performance.now()
    const endTime = startTime + duration
    const increment = targetNumber / (duration / 1000)

    const update = (currentTime: number) => {
      if (currentTime < endTime) {
        setCount((prev) => Math.min(prev + increment, targetNumber))
        requestAnimationFrame(update)
      } else {
        setCount(targetNumber)
      }
    }

    requestAnimationFrame(update)

    return () => {
      setCount(0)
    }
  }, [targetNumber, duration])

  return count
}
