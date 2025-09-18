'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  User, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Eye, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  Award,
  Target,
  Search,
  Bell,
  ArrowRight,
  Plus,
  Filter,
  Download,
  ExternalLink,
  Play,
  BookOpen,
  Users,
  Building2,
  DollarSign,
  Globe,
  MessageCircle,
  Heart,
  Bookmark,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Lightbulb,
  Coffee,
  Rocket
} from 'lucide-react';

interface DashboardStats {
  applications: number;
  interviews: number;
  profileViews: number;
  savedJobs: number;
}

interface RecentApplication {
  id: string;
  status: string;
  createdAt: string;
  job: {
    title: string;
    company: {
      name: string;
    };
    location?: string;
    city?: string;
    state?: string;
  };
}

interface RecommendedJob {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  location?: string;
  city?: string;
  state?: string;
  salaryMin?: number;
  salaryMax?: number;
  type: string;
  workMode: string;
  createdAt: string;
  matchScore?: number;
}

export default function CandidateDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    applications: 0,
    interviews: 0,
    profileViews: 0,
    savedJobs: 0
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'CANDIDATE') {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/candidate/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent applications
      const applicationsResponse = await fetch('/api/candidate/applications?limit=5');
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setRecentApplications(applicationsData.applications || []);
      }

      // Fetch recommended jobs
      const jobsResponse = await fetch('/api/candidate/jobs/recommended?limit=6');
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setRecommendedJobs(jobsData.jobs || []);
      }

      // Calculate profile completion
      const profileResponse = await fetch('/api/candidate/profile/completion');
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfileCompletion(profileData.completion || 0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPLIED: { label: 'Candidatou-se', className: 'bg-blue-100 text-blue-800', icon: User },
      SCREENING: { label: 'Triagem', className: 'bg-yellow-100 text-yellow-800', icon: Eye },
      INTERVIEW: { label: 'Entrevista', className: 'bg-purple-100 text-purple-800', icon: MessageCircle },
      HIRED: { label: 'Contratado', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { label: 'Rejeitado', className: 'bg-red-100 text-red-800', icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800', icon: User };
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
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

  const getWorkModeLabel = (mode: string) => {
    switch (mode) {
      case 'REMOTE':
        return 'Remoto';
      case 'HYBRID':
        return 'Híbrido';
      case 'ONSITE':
        return 'Presencial';
      default:
        return mode;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    if (max) return `Até R$ ${max.toLocaleString()}`;
    return null;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {session?.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-blue-100 mt-1">
              Pronto para encontrar sua próxima oportunidade?
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{profileCompletion}%</div>
              <div className="text-xs text-blue-100">Perfil Completo</div>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
          </div>
        </div>
        
        {profileCompletion < 80 && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Complete seu perfil para aumentar suas chances</span>
              </div>
              <button
                onClick={() => router.push('/candidato/perfil')}
                className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
              >
                Completar
              </button>
            </div>
            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Candidaturas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.applications}</p>
            </div>
          </div>
          <div className="mt-2">
            <button
              onClick={() => router.push('/candidato/candidaturas')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todas →
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Entrevistas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Este mês</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">{stats.profileViews}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Do seu perfil</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bookmark className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Vagas Salvas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.savedJobs}</p>
            </div>
          </div>
          <div className="mt-2">
            <button
              onClick={() => router.push('/candidato/vagas?filter=saved')}
              className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
            >
              Ver salvas →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Candidaturas Recentes</h2>
              <button
                onClick={() => router.push('/candidato/candidaturas')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver todas
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma candidatura ainda</h3>
                <p className="text-gray-600 mb-4">Comece a se candidatar para vagas que combinam com você</p>
                <button
                  onClick={() => router.push('/candidato/vagas')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buscar Vagas
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{application.job.title}</h4>
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>{application.job.company.name}</span>
                        {(application.job.location || (application.job.city && application.job.state)) && (
                          <>
                            <span>•</span>
                            <MapPin className="h-4 w-4" />
                            <span>{application.job.location || `${application.job.city}, ${application.job.state}`}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {getStatusBadge(application.status)}
                        <span className="text-xs text-gray-500">{formatDate(application.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Vagas Recomendadas</h2>
              <button
                onClick={() => router.push('/candidato/vagas')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Ver mais
              </button>
            </div>
          </div>
          <div className="p-6">
            {recommendedJobs.length === 0 ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma recomendação ainda</h3>
                <p className="text-gray-600 mb-4">Complete seu perfil para receber recomendações personalizadas</p>
                <button
                  onClick={() => router.push('/candidato/perfil')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Completar Perfil
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                       onClick={() => router.push(`/candidato/vagas/${job.id}`)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          {job.matchScore && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {job.matchScore}% match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                          <Building2 className="h-4 w-4" />
                          <span>{job.company.name}</span>
                          {(job.location || (job.city && job.state)) && (
                            <>
                              <span>•</span>
                              <MapPin className="h-4 w-4" />
                              <span>{job.location || `${job.city}, ${job.state}`}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{getTypeLabel(job.type)}</span>
                          <span>{getWorkModeLabel(job.workMode)}</span>
                          {formatSalary(job.salaryMin, job.salaryMax) && (
                            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => router.push('/candidato/vagas')}
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Search className="h-6 w-6 text-blue-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Buscar Vagas</div>
              <div className="text-sm text-gray-600">Encontre oportunidades</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/candidato/perfil')}
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <User className="h-6 w-6 text-green-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Atualizar Perfil</div>
              <div className="text-sm text-gray-600">Melhore sua visibilidade</div>
            </div>
          </button>

          {/* <button
            onClick={() => router.push('/candidato/academia')}
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <BookOpen className="h-6 w-6 text-purple-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Estudar</div>
              <div className="text-sm text-gray-600">Desenvolva habilidades</div>
            </div>
          </button> */}

          <button
            onClick={() => router.push('/candidato/insights')}
            className="flex items-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <BarChart3 className="h-6 w-6 text-yellow-600 mr-3" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Ver Insights</div>
              <div className="text-sm text-gray-600">Analise seu progresso</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}