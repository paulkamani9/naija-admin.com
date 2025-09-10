import { AuthHero } from '@/components/Auth/AuthHero'
import React from 'react'

const AuthLayout = ({ children}: {children: React.ReactNode}) => {
  return (
    <main className="flex w-full min-h-screen flex-row">
        <AuthHero />
      {children}
    </main>
  )
}

export default AuthLayout