import type { ChatMenuItem } from './types'

interface ChatMenuProps {
	menuItems: ChatMenuItem[]
	onSelect: (item: ChatMenuItem) => void
}

export function ChatMenu({ menuItems, onSelect }: ChatMenuProps) {
	return (
		<div className='space-y-2'>
			{menuItems.map((item) => (
				<button
					key={item.id}
					onClick={() => onSelect(item)}
					className='w-full rounded-lg border-2 border-primary-200 bg-white p-4 text-left shadow-sm transition-all hover:border-primary-400 hover:bg-primary-50 active:scale-[0.98]'
				>
					<div className='flex items-center gap-3'>
						{item.icon && (
							<div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600'>
								<span className='text-lg'>{item.icon}</span>
							</div>
						)}
						<div className='flex-1'>
							<h3 className='font-semibold text-foreground-primary'>
								{item.title}
							</h3>
							{item.description && (
								<p className='mt-1 text-sm text-foreground-muted'>
									{item.description}
								</p>
							)}
						</div>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
							className='text-foreground-muted'
						>
							<path d='M9 18l6-6-6-6' />
						</svg>
					</div>
				</button>
			))}
		</div>
	)
}

