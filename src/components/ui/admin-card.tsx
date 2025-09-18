'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface AdminCardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  icon?: LucideIcon
  className?: string
  headerAction?: ReactNode
  variant?: 'default' | 'gradient' | 'glass'
}

export function AdminCard({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  className = '', 
  headerAction,
  variant = 'default'
}: AdminCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'gradient':
        return 'bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/50 border-white/60 shadow-xl'
      case 'glass':
        return 'bg-white/70 backdrop-blur-xl border-white/40 shadow-2xl'
      default:
        return 'bg-white border-gray-200 shadow-lg'
    }
  }

  return (
    <div className={`rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${getVariantClasses()} ${className}`}>
      {(title || subtitle || Icon || headerAction) && (
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {Icon && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Icon className="h-5 w-5 text-white" />
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
            </div>
            {headerAction && (
              <div className="flex items-center space-x-2">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

// Componente para estatísticas
interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ title, value, icon: Icon, trend, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className={`inline-block w-0 h-0 mr-1 ${
                trend.isPositive 
                  ? 'border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-green-600'
                  : 'border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-600'
              }`} />
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

// Componente para lista de itens
interface ListCardProps {
  title: string
  items: Array<{
    id: string
    title: string
    subtitle?: string
    badge?: {
      text: string
      variant: 'success' | 'warning' | 'error' | 'info'
    }
    action?: ReactNode
  }>
  emptyMessage?: string
  className?: string
}

export function ListCard({ title, items, emptyMessage = 'Nenhum item encontrado', className = '' }: ListCardProps) {
  const getBadgeClasses = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <AdminCard title={title} variant="glass" className={className}>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/60 hover:bg-white/80 transition-colors">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                {item.subtitle && (
                  <p className="text-sm text-gray-600 mt-1">{item.subtitle}</p>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {item.badge && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getBadgeClasses(item.badge.variant)}`}>
                    {item.badge.text}
                  </span>
                )}
                {item.action}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminCard>
  )
}