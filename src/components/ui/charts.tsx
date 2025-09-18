'use client'

import React from 'react'

interface BarChartProps {
  data: Array<{
    label: string
    value: number
    color?: string
  }>
  title?: string
  height?: number
}

export function BarChart({ data, title, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  const barWidth = 40
  const spacing = 20
  const chartWidth = data.length * (barWidth + spacing) - spacing + 80
  const chartHeight = height - 60

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={height} className="min-w-full">
          {/* Y-axis */}
          <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
          
          {/* X-axis */}
          <line x1="40" y1={chartHeight + 20} x2={chartWidth - 20} y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
          
          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * chartHeight
            const x = 40 + index * (barWidth + spacing) + spacing / 2
            const y = chartHeight + 20 - barHeight
            
            return (
              <g key={index}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={item.color || '#3b82f6'}
                  className="hover:opacity-80 transition-opacity"
                />
                
                {/* Value label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.value}
                </text>
                
                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  transform={`rotate(-45, ${x + barWidth / 2}, ${chartHeight + 35})`}
                >
                  {item.label}
                </text>
              </g>
            )
          })}
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = Math.round(maxValue * ratio)
            const y = chartHeight + 20 - (ratio * chartHeight)
            
            return (
              <g key={index}>
                <line x1="35" y1={y} x2="40" y2={y} stroke="#9ca3af" strokeWidth="1" />
                <text x="30" y={y + 3} textAnchor="end" className="text-xs fill-gray-600">
                  {value}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

interface LineChartProps {
  data: Array<{
    label: string
    value: number
  }>
  title?: string
  height?: number
  color?: string
}

export function LineChart({ data, title, height = 300, color = '#3b82f6' }: LineChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  const minValue = Math.min(...data.map(item => item.value))
  const range = maxValue - minValue || 1
  
  const chartWidth = 600
  const chartHeight = height - 60
  const pointSpacing = (chartWidth - 80) / (data.length - 1)

  const points = data.map((item, index) => {
    const x = 40 + index * pointSpacing
    const y = chartHeight + 20 - ((item.value - minValue) / range) * chartHeight
    return { x, y, value: item.value, label: item.label }
  })

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <svg width={chartWidth} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight + 20 - (ratio * chartHeight)
          return (
            <line
              key={index}
              x1="40"
              y1={y}
              x2={chartWidth - 20}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          )
        })}
        
        {/* Y-axis */}
        <line x1="40" y1="20" x2="40" y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
        
        {/* X-axis */}
        <line x1="40" y1={chartHeight + 20} x2={chartWidth - 20} y2={chartHeight + 20} stroke="#e5e7eb" strokeWidth="1" />
        
        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          className="drop-shadow-sm"
        />
        
        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill={color}
              className="hover:r-6 transition-all cursor-pointer"
            />
            
            {/* Value label on hover */}
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="text-xs fill-gray-600 opacity-0 hover:opacity-100 transition-opacity"
            >
              {point.value}
            </text>
          </g>
        ))}
        
        {/* X-axis labels */}
        {points.map((point, index) => (
          <text
            key={index}
            x={point.x}
            y={chartHeight + 35}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {point.label}
          </text>
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = Math.round(minValue + (range * ratio))
          const y = chartHeight + 20 - (ratio * chartHeight)
          
          return (
            <text key={index} x="30" y={y + 3} textAnchor="end" className="text-xs fill-gray-600">
              {value}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

interface PieChartProps {
  data: Array<{
    label: string
    value: number
    color: string
  }>
  title?: string
  size?: number
}

export function PieChart({ data, title, size = 300 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - 40) / 2
  const centerX = size / 2
  const centerY = size / 2

  let currentAngle = -90 // Start from top

  const slices = data.map(item => {
    const percentage = (item.value / total) * 100
    const angle = (item.value / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    
    const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180)
    const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180)
    const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180)
    const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180)
    
    const largeArcFlag = angle > 180 ? 1 : 0
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z'
    ].join(' ')
    
    currentAngle += angle
    
    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1)
    }
  })

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="flex items-center justify-between">
        <svg width={size} height={size}>
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              title={`${slice.label}: ${slice.value} (${slice.percentage}%)`}
            />
          ))}
        </svg>
        
        <div className="ml-6 space-y-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center text-sm">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-gray-600">
                {slice.label}: {slice.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon?: React.ReactNode
  color?: string
}

export function StatCard({ title, value, change, icon, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}