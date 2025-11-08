import type { Achievement } from '@/components/fetchers/achievements'

export const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: '減碳新手',
    description: '完成第一次碳排放記錄',
    unlocked: true,
    unlockedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: '環保達人',
    description: '累積減碳超過 100kg',
    unlocked: false,
  },
  {
    id: '3',
    title: '連續記錄',
    description: '連續記錄 7 天',
    unlocked: false,
  },
  {
    id: '4',
    title: '發票大師',
    description: '記錄超過 50 筆發票',
    unlocked: false,
  },
  {
    id: '5',
    title: '綠色生活',
    description: '一個月內減碳超過 50kg',
    unlocked: false,
  },
  {
    id: '6',
    title: '記錄達人',
    description: '累積記錄超過 100 筆',
    unlocked: false,
  },
  {
    id: '7',
    title: '環保先鋒',
    description: '連續 30 天記錄碳排放',
    unlocked: false,
  },
  {
    id: '8',
    title: '減碳專家',
    description: '累積減碳超過 500kg',
    unlocked: false,
  },
  {
    id: '9',
    title: '分類大師',
    description: '使用所有類別記錄',
    unlocked: false,
  },
  {
    id: '10',
    title: '月度冠軍',
    description: '單月減碳量最高',
    unlocked: false,
  },
  {
    id: '11',
    title: '節能之星',
    description: '連續 14 天記錄',
    unlocked: false,
  },
  {
    id: '12',
    title: '環保大使',
    description: '累積減碳超過 1000kg',
    unlocked: false,
  },
]
