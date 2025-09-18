'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  Award, 
  TrendingUp, 
  Eye, 
  UserCheck, 
  AlertCircle, 
  Plus, 
  Filter, 
  Settings,
  ArrowUpRight,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalJobs: number;
  totalCertificates: number;
  activeJobs: number;
  pendingApplications: number;
  monthlyGrowth: {
    users: number;
    companies: number;
    jobs: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    avatar?: string;
  }>;
  recentJobs: Array<{
    id: string;
    title: string;
    company: string;
    createdAt: string;
    status: string;
    applications: number;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    lastBackup: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/login');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Mock data for development
      setStats({
        totalUsers: 1247,
        totalCompanies: 89,
        totalJobs: 156,
        totalCertificates: 342,
        activeJobs: 134,
        pendingApplications: 67,
        monthlyGrowth: {
          users: 12.5,
          companies: 8.3,
          jobs: 15.7,
        },
        recentUsers: [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@email.com',
            role: 'CANDIDATE',
            createdAt: '2024-01-15T10:30:00Z',
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@empresa.com',
            role: 'COMPANY',
            createdAt: '2024-01-15T09:15:00Z',
          },
          {
            id: '3',
            name: 'Pedro Costa',
            email: 'pedro@email.com',
            role: 'CANDIDATE',
            createdAt: '2024-01-14T16:45:00Z',
          },
        ],
        recentJobs: [
          {
            id: '1',
            title: 'Desenvolvedor Frontend',
            company: 'Tech Corp',
            createdAt: '2024-01-15T14:20:00Z',
            status: 'ACTIVE',
            applications: 23,
          },
          {
            id: '2',
            title: 'Designer UX/UI',
            company: 'Design Studio',
            createdAt: '2024-01-15T11:30:00Z',
            status: 'ACTIVE',
            applications: 15,
          },
          {
            id: '3',
            title: 'Analista de Dados',
            company: 'Data Solutions',
            createdAt: '2024-01-14T13:10:00Z',
            status: 'PENDING',
            applications: 8,
          },
        ],
        systemHealth: {
          status: 'healthy',
          uptime: '99.9%',
          lastBackup: '2024-01-15T02:00:00Z',
        },
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'COMPANY':
        return 'Empresa';
      case 'CANDIDATE':
        return 'Candidato';
      default:
        return 'Usuário';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPANY':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANDIDATE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INACTIVE':
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
        <p className="text-gray-600 mb-4">Não foi possível carregar as estatísticas do dashboard.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Visão geral da plataforma Xpecial</p>
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
            onClick={() => router.push('/admin/relatorios')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Relatórios
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">
                +{stats.monthlyGrowth?.users || 0}% este mês
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Empresas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCompanies.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">
                +{stats.monthlyGrowth?.companies || 0}% este mês
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeJobs.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">
                +{stats.monthlyGrowth?.jobs || 0}% este mês
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Certificados</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCertificates.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-1">
                {stats.pendingApplications} pendentes
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Status do Sistema</h2>
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            stats.systemHealth?.status === 'healthy' 
              ? 'bg-green-100 text-green-800' 
              : stats.systemHealth?.status === 'warning'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {stats.systemHealth?.status === 'healthy' && <CheckCircle className="h-4 w-4 mr-1" />}
            {stats.systemHealth?.status === 'warning' && <AlertCircle className="h-4 w-4 mr-1" />}
            {stats.systemHealth?.status === 'error' && <XCircle className="h-4 w-4 mr-1" />}
            {stats.systemHealth?.status === 'healthy' ? 'Saudável' : 
             stats.systemHealth?.status === 'warning' ? 'Atenção' : 'Erro'}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-2xl font-bold text-gray-900">{stats.systemHealth?.uptime || 'N/A'}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Último Backup</p>
            <p className="text-sm font-medium text-gray-900">
              {stats.systemHealth?.lastBackup ? formatDate(stats.systemHealth?.lastBackup) : 'N/A'}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Candidaturas Pendentes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Usuários Recentes</h2>
              <button
                onClick={() => router.push('/admin/users')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Ver todos
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Vagas Recentes</h2>
              <button
                onClick={() => router.push('/admin/jobs')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Ver todas
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.company}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {job.applications} candidaturas
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(job.status)}`}>
                      {job.status === 'ACTIVE' ? 'Ativa' : 
                       job.status === 'PENDING' ? 'Pendente' : 'Inativa'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/admin/users/novo')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-blue-100 rounded-lg mb-2">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Novo Usuário</span>
          </button>
          
          <button
            onClick={() => router.push('/admin/insights')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-green-100 rounded-lg mb-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Insights</span>
          </button>
          
          <button
            onClick={() => router.push('/admin/configuracoes')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-purple-100 rounded-lg mb-2">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Configurações</span>
          </button>
          
          <button
            onClick={() => router.push('/admin/relatorios')}
            className="flex flex-col items-center p-4 text-center hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="p-3 bg-yellow-100 rounded-lg mb-2">
              <Download className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  );
}