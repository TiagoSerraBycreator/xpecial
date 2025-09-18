'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, Filter, MoreVertical, Edit, Trash2, Eye, ArrowLeft, CheckCircle, XCircle, Briefcase, Plus } from 'lucide-react'
import { AdminPage, PageSection, CardGrid, ActionButton } from '@/components/ui/admin-page'
import { AdminCard } from '@/components/ui/admin-card'

interface Job {
  id: string
  title: string
  description: string
  requirements: string
  benefits: string
  salary?: string
  city?: string
  state?: string
  workType: 'REMOTE' | 'HYBRID' | 'ONSITE'
  contractType: 'CLT' | 'PJ' | 'INTERNSHIP' | 'FREELANCE'
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED'
  createdAt: string
  company: {
    id: string
    name: string
    email: string
  }
  _count: {
    applications: number
  }
}

export default function JobsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [workTypeFilter, setWorkTypeFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const jobsPerPage = 10

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login')
      return
    }

    fetchJobs()
  }, [session, status, router, currentPage, searchTerm, statusFilter])

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: jobsPerPage.toString(),
        search: searchTerm,
        status: statusFilter
      })

      const response = await fetch(`/api/admin/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
        setTotalPages(Math.ceil((data.total || 0) / jobsPerPage))
      }
    } catch (error) {
      console.error('Erro ao carregar vagas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchJobs()
      } else {
        alert('Erro ao atualizar status da vaga')
      }
    } catch (error) {
      console.error('Erro ao atualizar status da vaga:', error)
      alert('Erro ao atualizar status da vaga')
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) return

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchJobs()
      } else {
        alert('Erro ao excluir vaga')
      }
    } catch (error) {
      console.error('Erro ao excluir vaga:', error)
      alert('Erro ao excluir vaga')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      CLOSED: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      DRAFT: 'Rascunho',
      ACTIVE: 'Contratando',
      CLOSED: 'Fechada'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getWorkTypeBadge = (workType: string) => {
    const labels = {
      REMOTE: 'Remoto',
      HYBRID: 'Híbrido',
      ONSITE: 'Presencial'
    }

    return (
      <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
        {labels[workType as keyof typeof labels]}
      </span>
    )
  }

  if (status === 'loading' || loading) {
    return (
      <AdminPage title="Vagas" subtitle="Carregando...">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando vagas...</p>
          </div>
        </div>
      </AdminPage>
    )
  }

  return (
    <AdminPage 
      title="Gerenciar Vagas" 
      subtitle="Visualize e gerencie todas as vagas de emprego"
      icon={Briefcase}
      actions={[
        <ActionButton key="new" variant="primary" icon={Plus}>
          Nova Vaga
        </ActionButton>
      ]}
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Vagas', href: '/admin/jobs' }
      ]}
    >
        <PageSection title="Filtros">
          <AdminCard className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                  Buscar vagas
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    id="search"
                    placeholder="Título, empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="workType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de trabalho
                </label>
                <select
                  id="workType"
                  value={workTypeFilter}
                  onChange={(e) => setWorkTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="ALL">Todos os tipos</option>
                  <option value="REMOTE">Remoto</option>
                  <option value="HYBRID">Híbrido</option>
                  <option value="ONSITE">Presencial</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="ALL">Todos os status</option>
                  <option value="ACTIVE">Contratando</option>
                  <option value="DRAFT">Rascunhos</option>
                  <option value="CLOSED">Fechadas</option>
                </select>
              </div>
            </div>
          </AdminCard>
        </PageSection>

        <PageSection title="Vagas">
          <AdminCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vaga
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Candidaturas
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">
                          {job.city && job.state ? `${job.city}, ${job.state}` : 
                           job.city ? job.city : 
                           job.state ? job.state : 'Remoto'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.company.name}</div>
                      <div className="text-sm text-gray-500">{job.company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getWorkTypeBadge(job.workType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {job._count.applications}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => router.push(`/admin/jobs/${job.id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                          aria-label="Visualizar vaga"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {job.status === 'DRAFT' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'ACTIVE')}
                            className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
                            aria-label="Ativar vaga"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        {job.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateJobStatus(job.id, 'CLOSED')}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded transition-colors"
                            aria-label="Fechar vaga"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                          aria-label="Excluir vaga"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <ActionButton
                  variant="secondary"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </ActionButton>
                <ActionButton
                  variant="secondary"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </ActionButton>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Mostrando página <span className="font-semibold">{currentPage}</span> de{' '}
                    <span className="font-semibold">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <ActionButton
                      variant="secondary"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-r-none"
                    >
                      Anterior
                    </ActionButton>
                    <ActionButton
                      variant="secondary"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-l-none"
                    >
                      Próximo
                    </ActionButton>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </AdminCard>
      </PageSection>

        {jobs.length === 0 && (
          <PageSection>
            <AdminCard className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
              <p className="text-gray-500">Não há vagas que correspondam aos filtros selecionados.</p>
            </AdminCard>
          </PageSection>
        )}
    </AdminPage>
  )
}