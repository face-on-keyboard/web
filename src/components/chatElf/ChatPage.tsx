'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { ChatMessage, ChatMenuItem, ChatState } from './types'
import { ChatMenu } from './ChatMenu'
import { ChatMessageBubble } from './ChatMessageBubble'
import {
	CHAT_MENU_ITEMS,
	getAnswerByMenuId,
	WELCOME_MESSAGE,
} from './config'

export function ChatPage() {
	const router = useRouter()
	const [messages, setMessages] = useState<ChatMessage[]>([])
	const [currentState, setCurrentState] = useState<ChatState>('menu')
	const [isLoading, setIsLoading] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// 自動滾動到底部
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [])

	// 初始化：顯示歡迎消息和目錄
	useEffect(() => {
		const welcomeMessage: ChatMessage = {
			id: 'welcome',
			type: 'elf',
			content: WELCOME_MESSAGE,
			timestamp: new Date(),
			menuItems: CHAT_MENU_ITEMS,
		}
		setMessages([welcomeMessage])
		setCurrentState('menu')
	}, [])

	// 當消息更新時滾動到底部
	useEffect(() => {
		scrollToBottom()
	}, [messages, scrollToBottom])

	// 處理目錄項目選擇
	const handleMenuSelect = useCallback(
		(item: ChatMenuItem) => {
			// 添加用戶選擇消息
			const userMessage: ChatMessage = {
				id: `user-${Date.now()}`,
				type: 'user',
				content: item.title,
				timestamp: new Date(),
			}

			setMessages((prev) => [...prev, userMessage])
			setCurrentState('loading')
			setIsLoading(true)

			// 模擬 API 延遲
			setTimeout(() => {
				// 獲取回答
				const answer = getAnswerByMenuId(item.id)

				const elfMessage: ChatMessage = {
					id: `elf-${Date.now()}`,
					type: 'elf',
					content: answer,
					timestamp: new Date(),
				}

				// 添加詢問回到目錄的消息（帶返回目錄按鈕）
				const backToMenuQuestion: ChatMessage = {
					id: `back-to-menu-question-${Date.now()}`,
					type: 'elf',
					content: '需要我為你介紹其他減碳主題嗎？',
					timestamp: new Date(),
					showBackToMenu: true,
				}

				setMessages((prev) => [...prev, elfMessage, backToMenuQuestion])
				setCurrentState('conversation')
				setIsLoading(false)
			}, 500)
		},
		[],
	)

	// 處理回到目錄
	const handleBackToMenu = useCallback(() => {
		const backToMenuMessage: ChatMessage = {
			id: `back-to-menu-${Date.now()}`,
			type: 'elf',
			content: '請選擇一個主題開始吧！',
			timestamp: new Date(),
			menuItems: CHAT_MENU_ITEMS,
		}

		setMessages((prev) => [...prev, backToMenuMessage])
		setCurrentState('menu')
	}, [])

	// 獲取最後一條消息的目錄項目（如果有的話）
	const lastMessage = messages[messages.length - 1]
	const shouldShowMenu = currentState === 'menu' && lastMessage?.menuItems

	return (
		<div className='flex h-[calc(100svh-var(--mobile-bar-full-height))] flex-col bg-background-muted'>
			{/* 頂部標題欄 */}
			<div className='flex items-center gap-3 border-b border-grey-200 bg-white px-4 py-3 shadow-sm'>
				<button
					onClick={() => router.back()}
					className='flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-grey-100'
					aria-label='返回'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='text-foreground-primary'
					>
						<path d='M19 12H5' />
						<path d='M12 19l-7-7 7-7' />
					</svg>
				</button>
				<div className='flex items-center gap-2'>
					<div className='relative h-10 w-10 overflow-hidden rounded-full bg-primary-100'>
						<Image
							src='/icons/elf.svg'
							alt='精靈'
							width={40}
							height={40}
							className='object-cover'
						/>
					</div>
					<div>
						<h1 className='font-semibold text-foreground-primary'>減碳小精靈</h1>
						<p className='text-xs text-foreground-muted'>
							{isLoading ? '輸入中...' : '線上協助中'}
						</p>
					</div>
				</div>
			</div>

			{/* 消息區域 */}
			<div className='flex-1 overflow-y-auto px-4 pr-5 py-4'>
				{messages.map((message) => (
					<ChatMessageBubble
						key={message.id}
						message={message}
						onBackToMenu={
							message.showBackToMenu ? handleBackToMenu : undefined
						}
					/>
				))}

				{/* 顯示目錄（只在菜單狀態且最後一條消息有目錄時顯示） */}
				{shouldShowMenu && lastMessage.menuItems && (
					<ChatMenu
						menuItems={lastMessage.menuItems}
						onSelect={handleMenuSelect}
					/>
				)}

				{/* 加載中狀態 */}
				{isLoading && (
					<div className='mb-4 flex justify-start'>
						<div className='rounded-2xl bg-white px-4 py-3 shadow-md'>
							<div className='flex gap-1'>
								<div className='h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.3s]' />
								<div className='h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:-0.15s]' />
								<div className='h-2 w-2 animate-bounce rounded-full bg-primary-400' />
							</div>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>
		</div>
	)
}
