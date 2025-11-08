export interface CarbonRecordItem {
  name: string
  amount: number
  quantity: number
  category: string
  co2Amount: number
}

export interface CarbonRecord {
  id: string
  invoiceNumber: string
  date: string
  storeName: string
  totalAmount: number
  category: string
  totalCO2: number
  items: CarbonRecordItem[]
}

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
]

export const getCategoryLabel = (categoryValue: string) => {
  return (
    CARBON_CATEGORIES.find((c) => c.value === categoryValue)?.label ||
    categoryValue
  )
}

export const getCategoryColor = (categoryValue: string) => {
  return (
    CARBON_CATEGORIES.find((c) => c.value === categoryValue)?.color ||
    'bg-grey-100 text-grey-700'
  )
}

export const getCategoryIconElement = (
  categoryValue: string,
  size: 'sm' | 'md' | 'lg' = 'md'
) => {
  const category = CARBON_CATEGORIES.find((c) => c.value === categoryValue)
  if (!category) return <span className='text-lg'>📝</span>

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  // 如果使用圖片圖標
  if (category.iconType === 'image') {
    return (
      <img
        src={category.icon}
        alt={category.label}
        className={`${sizeClasses[size]} object-contain`}
      />
    )
  }

  // 使用 emoji
  const emojiSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  }
  return <span className={emojiSizes[size]}>{category.icon}</span>
}
