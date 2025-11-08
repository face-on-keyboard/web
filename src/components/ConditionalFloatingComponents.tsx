'use client'

import { usePathname } from 'next/navigation'

import { ChatElf } from '@/components/chatElf/ElfDialog'
import { FloatingElfButton } from '@/components/floating-elf-button'

export function ConditionalFloatingComponents() {
	const pathname = usePathname()
	
	// 在聊天页面不显示浮动组件
	if (pathname === '/chat') {
		return null
	}

	return (
		<>
			<ChatElf />
			<FloatingElfButton />
		</>
	)
}

