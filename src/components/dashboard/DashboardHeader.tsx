'use client'

import { useUser } from '../fetchers/user'

export const DashboardHeader = () => {
  const { data: user } = useUser()

  return (
    <div className='mt-2 mb-6'>
      <h1 className='mb-1 font-semibold text-foreground-primary text-h2'>
        減碳Dashboard
      </h1>
      <p className='text-body text-foreground-secondary'>
        快來查看你的減碳成績
      </p>
    </div>
  )
}
