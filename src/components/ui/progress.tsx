'use client'

import React from 'react'

interface ProgressProps {
  value?: number
  max?: number
  className?: string
  indicatorClassName?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showValue?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    value = 0, 
    max = 100, 
    className = '', 
    indicatorClassName = '',
    size = 'md',
    variant = 'default',
    showValue = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const sizeClasses = {
      sm: 'h-1',
      md: 'h-2',
      lg: 'h-3'
    }
    
    const variantClasses = {
      default: 'bg-blue-600',
      success: 'bg-green-600',
      warning: 'bg-yellow-600',
      error: 'bg-red-600'
    }
    
    return (
      <div className={`relative ${className}`}>
        <div
          ref={ref}
          className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          {...props}
        >
          <div
            className={`${sizeClasses[size]} ${variantClasses[variant]} transition-all duration-300 ease-in-out ${indicatorClassName}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showValue && (
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    )
  }
)

Progress.displayName = 'Progress'

export { Progress }