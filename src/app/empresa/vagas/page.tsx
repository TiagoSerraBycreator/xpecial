'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar, 
  Building2, 
  Users, 
  CheckCircle,
  Clock,
  Briefcase,
  DollarSign,
  MoreVertical,
  RefreshCw,
  AlertCircle,
  FileText,
  TrendingUp,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  city?: string;
  state?: string;
  location?: string;
  salary?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'PAUSED';
  createdAt: string;
  _count: {
    applications: number;
  };
}

interface JobsResponse {
  jobs: Job[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function CompanyJobs() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }

    fetchJobs();
  }, [session, status, router, currentPage, statusFilter, typeFilter, searchTerm]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      });

      const response = await fetch(`/api/company/jobs?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data: JobsResponse = await response.json();
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Mock data for development
      setJobs([
        {
          id: '1',
          title: 'Desenvolvedor Frontend React',
          description: 'Desenvolvedor experiente em React para trabalhar em projetos inovadores.',
          requirements: 'React, TypeScript, Next.js',
          location: 'São Paulo, SP',
          salary: 'R$ 8.000 - R$ 12.000',
          type: 'FULL_TIME',
          status: 'ACTIVE',
          createdAt: '2024-01-15T10:30:00Z',
          _count: { applications: 23 },
        },
        {
          id: '2',
          title: 'Designer UX/UI Sênior',
          description: 'Designer criativo para melhorar a experiência do usuário.',
          requirements: 'Figma, Adobe XD, Prototipagem',
          location: 'Rio de Janeiro, RJ',
          salary: 'R$ 6.000 - R$ 10.000',
          type: 'FULL_TIME',
          status: 'ACTIVE',
          createdAt: '2024-01-14T14:20:00Z',
          _count: { applications: 18 },
        },
        {
          id: '3',
          title: 'Analista de Dados',
          description: 'Profissional para análise e interpretação de dados.',
          requirements: 'Python, SQL, Power BI',
          location: 'Belo Horizonte, MG',
          salary: 'R$ 5.000 - R$ 8.000',
          type: 'FULL_TIME',
          status: 'DRAFT',
          createdAt: '2024-01-13T09:15:00Z',
          _count: { applications: 0 },
        },
        {
          id: '4',
          title: 'Estagiário de Marketing',
          description: 'Oportunidade de estágio em marketing digital.',
          requirements: 'Cursando Marketing ou áreas afins',
          location: 'Remoto',
          salary: 'R$ 1.200 - R$ 1.800',
          type: 'INTERNSHIP',
          status: 'ACTIVE',
          createdAt: '2024-01-12T16:45:00Z',
          _count: { applications: 45 },
        },
        {
          id: '5',
          title: 'Product Manager',
          description: 'Gerente de produto para liderar estratégias de desenvolvimento.',
          requirements: 'Experiência em gestão de produtos, Agile',
          location: 'São Paulo, SP',
          salary: 'R$ 12.000 - R$ 18.000',
          type: 'FULL_TIME',
          status: 'PAUSED',
          createdAt: '2024-01-11T11:20:00Z',
          _count: { applications: 12 },
        },
      ]);
      setTotal(5);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/company/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJobs(jobs.filter(job => job.id !== jobId));
        setShowDeleteConfirm(false);
        setJobToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) return;

    try {
      const response = await fetch('/api/company/jobs/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          jobIds: selectedJobs,
        }),
      });

      if (response.ok) {
        await fetchJobs();
        setSelectedJobs([]);
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'DRAFT':
        return 'Rascunho';
      case 'CLOSED':
        return 'Fechada';
      case 'PAUSED':
        return 'Pausada';
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CLOSED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PAUSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'FULL_TIME':
        return 'Tempo Integral';
      case 'PART_TIME':
        return 'Meio Período';
      case 'CONTRACT':
        return 'Contrato';
      case 'INTERNSHIP':
        return 'Estágio';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
    const matchesType = typeFilter === 'ALL' || job.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading && jobs.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Vagas</h1>
          <p className="text-gray-600 mt-1">
            {total} vaga{total !== 1 ? 's' : ''} encontrada{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => router.push('/empresa/vagas/nova')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Vaga
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar vagas por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Todos os status</option>
                  <option value="ACTIVE">Ativa</option>
                  <option value="DRAFT">Rascunho</option>
                  <option value="PAUSED">Pausada</option>
                  <option value="CLOSED">Fechada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Todos os tipos</option>
                  <option value="FULL_TIME">Tempo Integral</option>
                  <option value="PART_TIME">Meio Período</option>
                  <option value="CONTRACT">Contrato</option>
                  <option value="INTERNSHIP">Estágio</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedJobs.length} vaga{selectedJobs.length !== 1 ? 's' : ''} selecionada{selectedJobs.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedJobs([])}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Limpar seleção
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Ativar
              </button>
              <button
                onClick={() => handleBulkAction('pause')}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Pausar
              </button>
              <button
                onClick={() => handleBulkAction('close')}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedJobs([...selectedJobs, job.id]);
                        } else {
                          setSelectedJobs(selectedJobs.filter(id => id !== job.id));
                        }
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{job.title}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(job.status)}`}>
                          {getStatusLabel(job.status)}
                        </span>
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {getTypeLabel(job.type)}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        {job.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                        )}
                        {job.salary && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(job.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {job._count.applications} candidatura{job._count.applications !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => router.push(`/empresa/vagas/${job.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/empresa/vagas/${job.id}/editar`)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setJobToDelete(job);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                ? 'Tente ajustar os filtros de busca.'
                : 'Comece criando sua primeira vaga de emprego.'}
            </p>
            <button
              onClick={() => router.push('/empresa/vagas/nova')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Vaga
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, total)} de {total} resultados
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2 text-gray-400">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && jobToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a vaga "{jobToDelete.title}"? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setJobToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteJob(jobToDelete.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}