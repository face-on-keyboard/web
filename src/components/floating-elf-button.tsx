'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function FloatingElfButton() {
	const router = useRouter()
	const [isHovered, setIsHovered] = useState(false)

	const handleClick = () => {
		router.push('/chat')
	}

	return (
		<button
			onClick={handleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className='fixed right-4 z-50 flex h-16 w-16 items-center justify-center overflow-visible rounded-full bg-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95'
			style={{
				bottom: 'calc(var(--mobile-bar-full-height) + 1rem)',
			}}
			aria-label='精靈按鈕'
		>
			<Image
				src='/icons/elf.svg'
				alt='精靈'
				width={240}
				height={240}
				className={`transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}
				priority
				style={{
					position: 'relative',
				}}
			/>
		</button>
	)
}
