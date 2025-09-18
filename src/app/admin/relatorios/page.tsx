'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  PieChart,
  MapPin,
  Building2
} from 'lucide-react'
import { BarChart, LineChart, PieChart as PieChartComponent, StatCard } from '@/components/ui/charts'

interface ReportData {
  period: {
    start: string
    end: string
  }
  overview: {
    totalUsers: number
    totalJobs: number
    totalApplications: number
    newUsersInPeriod: number
    newJobsInPeriod: number
    newApplicationsInPeriod: number
  }
  userStats: {
    total: number
    byRole: Array<{ role: string; count: number }>
    newInPeriod: number
  }
  jobStats: {
    total: number
    byStatus: Array<{ status: string; count: number }>
    bySector: Array<{ sector: string; count: number }>
    newInPeriod: number
  }
  applicationStats: {
    total: number
    byStatus: Array<{ status: string; count: number }>
    newInPeriod: number
  }
  monthlyGrowth: Array<{
    month: string
    users: number
    jobs: number
    applications: number
  }>
  topCompanies: Array<{
    id: string
    name: string
    totalJobs: number
    totalApplications: number
  }>
  locationStats: Array<{
    location: string
    count: number
  }>
}

export default function RelatoriosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchReportData()
  }, [session, status, router])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      })
      
      const response = await fetch(`/api/admin/relatorios?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar relatórios')
      }
      
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchReportData()
  }

  const handleDateRangeChange = () => {
    fetchReportData()
  }

  const exportReport = () => {
    if (!reportData) return
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-${dateRange.start}-${dateRange.end}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar relatórios</h1>
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const roleColors = {
    ADMIN: '#ef4444',
    COMPANY: '#3b82f6',
    CANDIDATE: '#10b981'
  }

  const statusColors = {
    PENDING: '#f59e0b',
    APPROVED: '#10b981',
    REJECTED: '#ef4444',
    APPLIED: '#3b82f6',
    REVIEWING: '#8b5cf6',
    ACCEPTED: '#10b981'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatórios Administrativos
            </h1>
            <p className="text-gray-600">
              Análises detalhadas e insights sobre o desempenho da plataforma
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            
            <button
              onClick={exportReport}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-gray-500">até</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleDateRangeChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Usuários"
            value={reportData.overview.totalUsers}
            change={{
              value: reportData.overview.newUsersInPeriod,
              type: 'increase'
            }}
            icon={<Users className="h-6 w-6" />}
            color="blue"
          />
          
          <StatCard
            title="Total de Vagas"
            value={reportData.overview.totalJobs}
            change={{
              value: reportData.overview.newJobsInPeriod,
              type: 'increase'
            }}
            icon={<Briefcase className="h-6 w-6" />}
            color="green"
          />
          
          <StatCard
            title="Total de Candidaturas"
            value={reportData.overview.totalApplications}
            change={{
              value: reportData.overview.newApplicationsInPeriod,
              type: 'increase'
            }}
            icon={<FileText className="h-6 w-6" />}
            color="purple"
          />
          
          <StatCard
            title="Novos no Período"
            value={reportData.overview.newUsersInPeriod}
            icon={<TrendingUp className="h-6 w-6" />}
            color="indigo"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Growth */}
          <LineChart
            data={reportData.monthlyGrowth.map(item => ({
              label: item.month,
              value: item.users + item.jobs + item.applications
            }))}
            title="Crescimento Mensal (Total)"
            color="#3b82f6"
          />

          {/* Users by Role */}
          <PieChartComponent
            data={reportData.userStats.byRole.map(item => ({
              label: item.role,
              value: item.count,
              color: roleColors[item.role as keyof typeof roleColors] || '#6b7280'
            }))}
            title="Usuários por Tipo"
          />

          {/* Jobs by Sector */}
          <BarChart
            data={reportData.jobStats.bySector.slice(0, 8).map(item => ({
              label: item.sector || 'Outros',
              value: item.count,
              color: '#10b981'
            }))}
            title="Vagas por Setor"
          />

          {/* Applications by Status */}
          <PieChartComponent
            data={reportData.applicationStats.byStatus.map(item => ({
              label: item.status,
              value: item.count,
              color: statusColors[item.status as keyof typeof statusColors] || '#6b7280'
            }))}
            title="Candidaturas por Status"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Companies */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <Building2 className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Top Empresas</h3>
            </div>
            <div className="space-y-3">
              {reportData.topCompanies.slice(0, 5).map((company, index) => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-600">{company.totalJobs} vagas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{company.totalApplications}</p>
                    <p className="text-xs text-gray-500">candidaturas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Vagas por Localização</h3>
            </div>
            <div className="space-y-3">
              {reportData.locationStats.slice(0, 5).map((location, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{location.location}</p>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {location.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}