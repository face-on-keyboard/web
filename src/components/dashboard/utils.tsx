import type { ReactNode } from 'react'

import { CARBON_CATEGORIES } from './constants'

type IconSize = 'sm' | 'md' | 'lg'

export const getCategoryLabel = (categoryValue: string): string => {
	return (
		CARBON_CATEGORIES.find((c) => c.value === categoryValue)?.label ??
		categoryValue
	)
}

export const getCategoryColor = (categoryValue: string): string => {
	return (
		CARBON_CATEGORIES.find((c) => c.value === categoryValue)?.color ??
		'bg-grey-100 text-grey-700'
	)
}

export const getCategoryIconElement = (
	categoryValue: string,
	size: IconSize = 'md',
): ReactNode => {
	const category = CARBON_CATEGORIES.find((c) => c.value === categoryValue)
	if (!category) return <span className='text-lg'>📝</span>

	const sizeClasses: Record<IconSize, string> = {
		sm: 'h-4 w-4',
		md: 'h-5 w-5',
		lg: 'h-6 w-6',
	}

	if (category.iconType === 'image') {
		return (
			<img
				src={category.icon}
				alt={category.label}
				className={`${sizeClasses[size]} object-contain`}
			/>
		)
	}

	const emojiSizes: Record<IconSize, string> = {
		sm: 'text-base',
		md: 'text-lg',
		lg: 'text-xl',
	}

	return <span className={emojiSizes[size]}>{category.icon}</span>
}
