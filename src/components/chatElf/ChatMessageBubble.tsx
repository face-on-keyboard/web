import type { ChatMessage } from './types'

interface ChatMessageBubbleProps {
	message: ChatMessage
	onBackToMenu?: () => void
}

export function ChatMessageBubble({
	message,
	onBackToMenu,
}: ChatMessageBubbleProps) {
	const isElf = message.type === 'elf'

	return (
		<div
			className={`mb-4 flex ${isElf ? 'justify-start' : 'justify-end'}`}
		>
			<div
				className={`max-w-[85%] rounded-2xl px-4 py-3 ${
					isElf
						? 'bg-white text-foreground-primary shadow-md'
						: 'bg-primary-500 text-white'
				}`}
			>
				<p className='text-sm leading-relaxed whitespace-pre-wrap break-words'>
					{message.content}
				</p>
				
				{/* 返回目錄按鈕 */}
				{message.showBackToMenu && isElf && onBackToMenu && (
					<button
						onClick={onBackToMenu}
						className='mt-3 w-full rounded-lg border-2 border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-600 transition-colors hover:border-primary-400 hover:bg-primary-100 active:scale-[0.98]'
					>
						返回目錄
					</button>
				)}

				{message.timestamp && (
					<p
						className={`mt-2 text-xs ${
							isElf ? 'text-foreground-muted' : 'text-white/70'
						}`}
					>
						{message.timestamp.toLocaleTimeString('zh-TW', {
							hour: '2-digit',
							minute: '2-digit',
						})}
					</p>
				)}
			</div>
		</div>
	)
}

