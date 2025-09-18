'use client'

import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {children}
      </div>
    </div>
  )
}