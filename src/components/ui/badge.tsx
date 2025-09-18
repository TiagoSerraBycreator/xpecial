'use client'

import React from 'react'

// Implementation without class-variance-authority
const getBadgeClasses = (variant: string = 'default') => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
  
  const variantClasses = {
    default: 'border-transparent bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'border-transparent bg-red-600 text-white hover:bg-red-700',
    outline: 'text-gray-900 border-gray-300 bg-white hover:bg-gray-50',
    success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
    warning: 'border-transparent bg-yellow-600 text-white hover:bg-yellow-700',
  }
  
  return `${baseClasses} ${variantClasses[variant as keyof typeof variantClasses] || variantClasses.default}`
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={`${getBadgeClasses(variant)} ${className}`}
      {...props}
    />
  )
}

export { Badge }