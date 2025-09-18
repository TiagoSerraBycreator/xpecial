'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Building2, 
  Users, 
  FileText, 
  Eye, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown, 
  Briefcase,
  AlertCircle,
  Calendar,
  Target,
  Award,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  Filter,
  Search
} from 'lucide-react';

interface CompanyStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  approvedCandidates: number;
  participatingCandidates: number;
  monthlyGrowth: {
    jobs: number;
    applications: number;
    candidates: number;
  };
  recentJobs: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    _count: {
      applications: number;
    };
  }>;
  recentApplications: Array<{
    id: string;
    status: string;
    createdAt: string;
    candidate: {
      user: {
        name: string;
        email: string;
      };
    };
    job: {
      title: string;
    };
  }>;
  topPerformingJobs: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
  }>;
}

export default function CompanyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/company/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Mock data for development
      setStats({
        totalJobs: 24,
        activeJobs: 18,
        totalApplications: 156,
        approvedCandidates: 42,
        participatingCandidates: 28,
        monthlyGrowth: {
          jobs: 15.2,
          applications: 23.8,
          candidates: 18.5,
        },
        recentJobs: [
          {
            id: '1',
            title: 'Desenvolvedor Frontend React',
            status: 'ACTIVE',
            createdAt: '2024-01-15T10:30:00Z',
            _count: { applications: 23 },
          },
          {
            id: '2',
            title: 'Designer UX/UI Sênior',
            status: 'ACTIVE',
            createdAt: '2024-01-14T14:20:00Z',
            _count: { applications: 18 },
          },
          {
            id: '3',
            title: 'Analista de Dados',
            status: 'DRAFT',
            createdAt: '2024-01-13T09:15:00Z',
            _count: { applications: 0 },
          },
        ],
        recentApplications: [
          {
            id: '1',
            status: 'PENDING',
            createdAt: '2024-01-15T16:45:00Z',
            candidate: {
              user: {
                name: 'João Silva',
                email: 'joao@email.com',
              },
            },
            job: {
              title: 'Desenvolvedor Frontend React',
            },
          },
          {
            id: '2',
            status: 'APPROVED',
            createdAt: '2024-01-15T14:30:00Z',
            candidate: {
              user: {
                name: 'Maria Santos',
                email: 'maria@email.com',
              },
            },
            job: {
              title: 'Designer UX/UI Sênior',
            },
          },
          {
            id: '3',
            status: 'PENDING',
            createdAt: '2024-01-15T11:20:00Z',
            candidate: {
              user: {
                name: 'Pedro Costa',
                email: 'pedro@email.com',
              },
            },
            job: {
              title: 'Desenvolvedor Frontend React',
            },
          },
        ],
        topPerformingJobs: [
          {
            id: '1',
            title: 'Desenvolvedor Frontend React',
            applications: 23,
            views: 145,
          },
          {
            id: '2',
            title: 'Designer UX/UI Sênior',
            applications: 18,
            views: 98,
          },
          {
            id: '3',
            title: 'Product Manager',
            applications: 15,
            views: 87,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativa';
      case 'DRAFT':
        return 'Rascunho';
      case 'CLOSED':
        return 'Fechada';
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovado';
      case 'REJECTED':
        return 'Rejeitado';
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
      case 'PENDING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
        <p className="text-gray-600 mb-4">Não foi possível carregar as estatísticas da empresa.</p>
        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard da Empresa</h1>
          <p className="text-gray-600 mt-1">Gerencie suas vagas e candidatos</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.activeJobs || 0}</p>
              <p className="text-sm text-green-600 mt-1">
                +{stats?.monthlyGrowth?.jobs || 0}% este mês
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Candidaturas</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
              <p className="text-sm text-green-600 mt-1">
                +{stats?.monthlyGrowth?.applications || 0}% este mês
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Candidatos Aprovados</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.approvedCandidates || 0}</p>
              <p className="text-sm text-green-600 mt-1">
                +{stats?.monthlyGrowth?.candidates || 0}% este mês
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Candidatos Participando</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.participatingCandidates || 0}</p>
              <p className="text-sm text-gray-600 mt-1">
                Em processo seletivo
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/empresa/vagas/nova')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-blue-100 rounded-lg mb-2">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Criar Vaga</span>
          </button>
          
          <button
            onClick={() => router.push('/empresa/candidatos')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-green-100 rounded-lg mb-2">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Ver Candidatos</span>
          </button>
          
          <button
            onClick={() => router.push('/empresa/insights')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-purple-100 rounded-lg mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Insights</span>
          </button>
          
          <button
            onClick={() => router.push('/empresa/perfil')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-yellow-100 rounded-lg mb-2">
              <Building2 className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Perfil</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Vagas Recentes</h2>
              <button
                onClick={() => router.push('/empresa/vagas')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Ver todas
                <ExternalLink className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(stats?.recentJobs || []).map((job) => (
                <div key={job.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {job._count.applications} candidaturas
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Candidaturas Recentes</h2>
              <button
                onClick={() => router.push('/empresa/candidatos')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Ver todas
                <ExternalLink className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(stats?.recentApplications || []).map((application) => (
                <div key={application.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {application.candidate.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {application.job.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vagas com Melhor Performance</h2>
          <p className="text-sm text-gray-600 mt-1">Baseado em visualizações e candidaturas</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {(stats?.topPerformingJobs || []).map((job, index) => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500">
                      {job.applications} candidaturas • {job.views} visualizações
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{job.applications}</p>
                    <p className="text-xs text-gray-500">candidaturas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{job.views}</p>
                    <p className="text-xs text-gray-500">visualizações</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}