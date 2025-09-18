'use client'

import { ReactNode } from 'react'

interface PublicCompanyLayoutProps {
  children: ReactNode
}

export default function PublicCompanyLayout({ children }: PublicCompanyLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}