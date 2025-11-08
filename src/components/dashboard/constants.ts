import type { CarbonRecord } from './types'

export const CARBON_CATEGORIES = [
  {
    value: 'food',
    label: '食物',
    icon: '/icons/eat.svg',
    iconType: 'image' as const,
    color: 'bg-green-100 text-green-700',
  },
  {
    value: 'shopping',
    label: '購物',
    icon: '/icons/shopping.svg',
    iconType: 'image' as const,
    color: 'bg-purple-100 text-purple-700',
  },
  {
    value: 'transport',
    label: '交通',
    icon: '/icons/transport.svg',
    iconType: 'image' as const,
    color: 'bg-blue-100 text-blue-700',
  },
  {
    value: 'other',
    label: '其他',
    icon: '/icons/other.svg',
    iconType: 'image' as const,
    color: 'bg-grey-100 text-grey-700',
  },
] as const

export type CarbonCategory = (typeof CARBON_CATEGORIES)[number]

export type CategoryStats = Record<string, number>

export const deriveCategoryStats = (records: CarbonRecord[]): CategoryStats => {
  return records.reduce((acc, record) => {
    const category =
      CARBON_CATEGORIES.find((c) => c.value === record.category)?.label ??
      record.category
    acc[category] = (acc[category] ?? 0) + record.totalCO2
    return acc
  }, {} as CategoryStats)
}


