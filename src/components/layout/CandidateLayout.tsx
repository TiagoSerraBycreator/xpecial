'use client'

import { ReactNode } from 'react'
import DashboardLayout from './dashboard-layout'

interface CandidateLayoutProps {
  children: ReactNode
  className?: string
}

export default function CandidateLayout({ children, className = '' }: CandidateLayoutProps) {
  return (
    <DashboardLayout className={className}>
      {children}
    </DashboardLayout>
  )
}