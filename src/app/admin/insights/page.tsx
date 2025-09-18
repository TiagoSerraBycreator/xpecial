'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarIcon, Users, Building2, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface InsightsData {
  users: {
    total: number
    period: number
    growth: number
    chartData: Array<{ date: string; count: number }>
  }
  companies: {
    total: number
    period: number
    growth: number
    chartData: Array<{ date: string; count: number }>
  }
}

interface DateRange {
  from: Date
  to: Date
}

export default function AdminInsights() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [comparisonPeriod, setComparisonPeriod] = useState('previous')
  const [quickFilter, setQuickFilter] = useState('30d')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchInsights()
  }, [session, status, router, dateRange, comparisonPeriod])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRange,
          comparisonPeriod
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar insights')
      }

      const data = await response.json()
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFilter = (period: string) => {
    setQuickFilter(period)
    const now = new Date()
    let from: Date

    switch (period) {
      case '7d':
        from = subDays(now, 7)
        break
      case '30d':
        from = subDays(now, 30)
        break
      case '90d':
        from = subDays(now, 90)
        break
      case '6m':
        from = subMonths(now, 6)
        break
      case '1y':
        from = subYears(now, 1)
        break
      default:
        from = subDays(now, 30)
    }

    setDateRange({
      from: startOfDay(from),
      to: endOfDay(now)
    })
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600'
    
    return (
      <div className={`flex items-center gap-1 ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">
          {isPositive ? '+' : ''}{growth.toFixed(1)}%
        </span>
      </div>
    )
  }

  const SimpleChart = ({ data, color }: { data: Array<{ date: string; count: number }>, color: string }) => {
    const maxValue = Math.max(...data.map(d => d.count))
    
    return (
      <div className="flex items-end gap-1 h-16">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex-1 bg-gray-100 rounded-sm relative group"
            style={{ minHeight: '4px' }}
          >
            <div
              className={`${color} rounded-sm transition-all duration-200 group-hover:opacity-80`}
              style={{
                height: maxValue > 0 ? `${(item.count / maxValue) * 100}%` : '4px'
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando insights...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchInsights}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-4 sm:p-6 text-white mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8" />
                Insights do Sistema
              </h1>
              <p className="text-blue-100 text-sm sm:text-base mt-1">Análise de crescimento de usuários e empresas cadastradas</p>
            </div>
            <div className="text-right">
              <p className="text-xs sm:text-sm text-blue-200">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filtros de Período</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Selecione o período para análise dos dados</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro Rápido */}
            <div className="space-y-2">
              <Label>Período Rápido</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: '7d', label: '7 dias' },
                  { value: '30d', label: '30 dias' },
                  { value: '90d', label: '90 dias' },
                  { value: '6m', label: '6 meses' },
                  { value: '1y', label: '1 ano' }
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={quickFilter === filter.value ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleQuickFilter(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={format(dateRange.from, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={format(dateRange.to, 'yyyy-MM-dd')}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Comparar com</Label>
            <Select value={comparisonPeriod} onValueChange={setComparisonPeriod}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">Período anterior</SelectItem>
                <SelectItem value="same_last_year">Mesmo período ano passado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Insights */}
        {insights && insights.users && insights.companies && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Usuários */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários Cadastrados
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Período: {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{insights.users.total}</p>
                      <p className="text-sm text-gray-600">Total geral</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{insights.users.period}</p>
                      <p className="text-sm text-gray-600">No período</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Crescimento vs período anterior:</span>
                    {formatGrowth(insights.users.growth)}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Cadastros por dia</h4>
                    <SimpleChart data={insights.users.chartData} color="bg-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Empresas */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Empresas Cadastradas
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Período: {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{insights.companies.total}</p>
                      <p className="text-sm text-gray-600">Total geral</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{insights.companies.period}</p>
                      <p className="text-sm text-gray-600">No período</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Crescimento vs período anterior:</span>
                    {formatGrowth(insights.companies.growth)}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Cadastros por dia</h4>
                    <SimpleChart data={insights.companies.chartData} color="bg-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}