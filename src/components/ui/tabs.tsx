'use client'

import React, { createContext, useContext, useState } from 'react'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

const Tabs = ({ defaultValue, value, onValueChange, children, className = '' }: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue)
  
  const currentValue = value ?? internalValue
  const handleValueChange = onValueChange ?? setInternalValue
  
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList = ({ children, className = '' }: TabsListProps) => {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const TabsTrigger = ({ value, children, className = '', disabled = false }: TabsTriggerProps) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs')
  }
  
  const { value: currentValue, onValueChange } = context
  const isActive = currentValue === value
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      disabled={disabled}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-white text-gray-950 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      onClick={() => !disabled && onValueChange(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent = ({ value, children, className = '' }: TabsContentProps) => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('TabsContent must be used within Tabs')
  }
  
  const { value: currentValue } = context
  
  if (currentValue !== value) {
    return null
  }
  
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      aria-labelledby={`tab-${value}`}
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }