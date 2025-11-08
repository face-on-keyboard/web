import '@/styles/globals.css'
import { Home, MapIcon, User } from 'lucide-react'

import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import Link from 'next/link'
import { FloatingElfButton } from '@/components/floating-elf-button'

export const metadata: Metadata = {
  title: '減碳儀表板',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const navItems = [
    {
      icon: Home,
      name: '首頁',
      link: '/',
    },
    {
      icon: MapIcon,
      name: '地圖',
      link: '/map',
    },
    {
      icon: User,
      name: '我的',
      link: '/profile',
    },
  ]

  return (
    <html
      lang='en'
      className={`${roboto.variable} bg-background-muted`}
      style={
        {
          '--mobile-bar-height': '75px',
          '--mobile-bar-full-height':
            'calc(75px + env(safe-area-inset-bottom))',
          '--screen-height-mobile':
            'calc(100svh - var(--mobile-bar-height) - env(safe-area-inset-bottom))',
          '--screen-height': 'calc(100svh - var(--header-height))',
        } as React.CSSProperties
      }
    >
      <body>
        <div className='min-h-[calc(100svh-var(--mobile-bar-full-height))] max-w-md text-black'>
          {children}
        </div>
        <FloatingElfButton />
        <div className='sticky bottom-0 flex h-(--mobile-bar-full-height) items-center justify-between border-primary-400 border-t-2 bg-primary-500 px-15 pb-2 text-white'>
          {navItems.map((item) => (
            <Link href={item.link} className='' key={item.name}>
              <item.icon />
              <span className='text-caption'>{item.name}</span>
            </Link>
          ))}
        </div>
      </body>
    </html>
  )
}
