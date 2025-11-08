import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'

export const metadata: Metadata = {
	title: '碳排 Dashboard',
	icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const roboto = Roboto({
	subsets: ['latin'],
	variable: '--font-roboto',
})

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' className={`${roboto.variable}`}>
			<body>{children}</body>
		</html>
	)
}
