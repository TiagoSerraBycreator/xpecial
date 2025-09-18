'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import AdminLayout from '@/components/layout/admin-layout'

interface AdminPageProps {
  children: ReactNode
  title: string
  subtitle?: string
  icon?: LucideIcon
  actions?: ReactNode
  breadcrumbs?: Array<{
    label: string
    href?: string
  }>
}

export function AdminPage({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  actions,
  breadcrumbs
}: AdminPageProps) {
  return (
    <AdminLayout title={title} subtitle={subtitle}>
      {/* Page Header */}
      <div className="mb-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <a href={crumb.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Page Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {Icon && (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="text-lg text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </AdminLayout>
  )
}

// Componente para seções da página
interface PageSectionProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function PageSection({ children, title, subtitle, className = '' }: PageSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// Componente para grid de cards
interface CardGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function CardGrid({ children, columns = 3, className = '' }: CardGridProps) {
  const getGridClasses = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 lg:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  return (
    <div className={`grid gap-6 ${getGridClasses()} ${className}`}>
      {children}
    </div>
  )
}

// Componente para botões de ação
interface ActionButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'card'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  disabled?: boolean
  className?: string
}

export function ActionButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  disabled = false,
  className = ''
}: ActionButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
      case 'secondary':
        return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg'
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl'
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
      case 'card':
        return 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 text-gray-800 border border-blue-100/60 hover:border-blue-200 hover:from-blue-50/50 hover:to-indigo-100/70 shadow-lg hover:shadow-xl backdrop-blur-sm'
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'md':
        return variant === 'card' ? 'p-6' : 'px-4 py-2.5 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      default:
        return variant === 'card' ? 'p-6' : 'px-4 py-2.5 text-sm'
    }
  }

  if (variant === 'card') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`group relative w-full text-left rounded-2xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      >
        <div className="flex items-start space-x-4">
          {Icon && (
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {children}
          </div>
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {Icon && (
        <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${children ? 'mr-2' : ''}`} />
      )}
      {children}
    </button>
  )
}