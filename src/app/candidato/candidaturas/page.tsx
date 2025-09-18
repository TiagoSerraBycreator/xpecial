'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Hourglass,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  DollarSign,
  Globe,
  Home,
  Users,
  TrendingUp,
  Award,
  Target,
  Send,
  MessageSquare,
  Download,
  ExternalLink,
  Star,
  Heart,
  Share2,
  Bookmark,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  MoreVertical,
  FileText,
  Trash2,
  Edit3
} from 'lucide-react';

interface Application {
  id: string;
  status: 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'INTERVIEW' | 'OFFER' | 'HIRED';
  createdAt: string;
  updatedAt: string;
  message?: string;
  job: {
    id: string;
    title: string;
    location?: string;
    city?: string;
    state?: string;
    salaryMin?: number;
    salaryMax?: number;
    workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
    company: {
      name: string;
    };
  };
  feedback?: {
    message: string;
    createdAt: string;
  };
}

interface ApplicationsResponse {
  applications: Application[];
  totalPages: number;
  currentPage: number;
  totalApplications: number;
  stats: {
    pending: number;
    reviewing: number;
    approved: number;
    rejected: number;
    interview: number;
    offer: number;
    hired: number;
  };
}

export default function CandidateApplications() {
  const { data: session } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    interview: 0,
    offer: 0,
    hired: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter, sortBy, searchTerm]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Construir parâmetros da URL
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/candidate/applications?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar candidaturas');
      }

      const data = await response.json();
      
      // Calcular estatísticas dos dados recebidos
       const statsCalculated = {
         pending: 0,
         reviewing: 0,
         approved: 0,
         rejected: 0,
         interview: 0,
         offer: 0,
         hired: 0
       };

       data.applications.forEach((app: Application) => {
         const statusKey = app.status.toLowerCase() as keyof typeof statsCalculated;
         if (statusKey in statsCalculated) {
           statsCalculated[statusKey]++;
         }
       });

      setApplications(data.applications);
       setStats(statsCalculated);
       setTotalPages(data.totalPages);
       setTotalCount(data.totalCount || data.applications.length);
    } catch (error) {
      console.error('Erro ao carregar candidaturas:', error);
      // Em caso de erro, mostrar dados vazios
       setApplications([]);
       setStats({
         pending: 0,
         reviewing: 0,
         approved: 0,
         rejected: 0,
         interview: 0,
         offer: 0,
         hired: 0
       });
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      PENDING: {
        label: 'Pendente',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        description: 'Aguardando análise'
      },
      REVIEWING: {
        label: 'Em Análise',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Eye,
        description: 'Sendo analisada pela empresa'
      },
      INTERVIEW: {
        label: 'Entrevista',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Users,
        description: 'Selecionado para entrevista'
      },
      APPROVED: {
        label: 'Aprovado',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        description: 'Candidatura aprovada'
      },
      OFFER: {
        label: 'Proposta',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: Award,
        description: 'Proposta de trabalho'
      },
      HIRED: {
        label: 'Contratado',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        icon: CheckCircle,
        description: 'Contratado pela empresa'
      },
      REJECTED: {
        label: 'Rejeitado',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        description: 'Candidatura não aprovada'
      }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
  };

  const getWorkModeInfo = (mode: string) => {
    const modeMap = {
      REMOTE: { label: 'Remoto', icon: Home, color: 'text-green-600' },
      HYBRID: { label: 'Híbrido', icon: Globe, color: 'text-blue-600' },
      ONSITE: { label: 'Presencial', icon: Building2, color: 'text-gray-600' }
    };
    return modeMap[mode as keyof typeof modeMap] || modeMap.REMOTE;
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salário não informado';
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    return `Até R$ ${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // A API já faz a filtragem, então usamos os dados diretamente
  const sortedApplications = [...applications].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'company':
        return a.job.company.name.localeCompare(b.job.company.name);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando candidaturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="h-8 w-8 mr-3 text-blue-600" />
                  Minhas Candidaturas
                </h1>
                <p className="text-gray-600 mt-1">Acompanhe o status das suas candidaturas</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {viewMode === 'list' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => fetchApplications()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Object.entries(stats).map(([status, count]) => {
            const statusInfo = getStatusInfo(status);
            const Icon = statusInfo.icon;
            return (
              <div key={status} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{statusInfo.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por vaga ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os status</option>
                <option value="PENDING">Pendente</option>
                <option value="REVIEWING">Em Análise</option>
                <option value="INTERVIEW">Entrevista</option>
                <option value="APPROVED">Aprovado</option>
                <option value="OFFER">Proposta</option>
                <option value="HIRED">Contratado</option>
                <option value="REJECTED">Rejeitado</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="company">Por empresa</option>
                <option value="status">Por status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {sortedApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma candidatura encontrada</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Você ainda não se candidatou a nenhuma vaga.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => router.push('/candidato/vagas')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explorar Vagas
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedApplications.map((application) => {
              const statusInfo = getStatusInfo(application.status);
              const workModeInfo = getWorkModeInfo(application.job.workMode);
              const StatusIcon = statusInfo.icon;
              const WorkModeIcon = workModeInfo.icon;

              return (
                <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{application.job.title}</h3>
                          <p className="text-sm text-gray-600">{application.job.company.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {application.job.location || 'Localização não informada'}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <WorkModeIcon className={`h-4 w-4 mr-2 ${workModeInfo.color}`} />
                        {workModeInfo.label}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {formatSalary(application.job.salaryMin, application.job.salaryMax)}
                      </div>
                    </div>

                    {/* Feedback */}
                    {application.feedback && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-700">{application.feedback.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(application.feedback.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        Candidatura: {formatDate(application.createdAt)}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/candidato/vagas/${application.job.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Ver vaga
                        </button>
                        
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalCount)} de {totalCount} candidaturas
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="px-3 py-2 text-sm font-medium">
                {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}