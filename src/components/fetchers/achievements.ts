import { mockAchievements } from '@/mock/achievements'

export type Achievement = {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string
}

export function useAchievements() {
  return {
    data: mockAchievements,
    isLoading: false,
    error: null,
  }
}
