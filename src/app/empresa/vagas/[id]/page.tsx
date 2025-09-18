'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye, 
  Mail, 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  Trash2,
  Share2,
  Download,
  Filter,
  Search,
  MoreVertical,
  Star,
  Building2,
  Briefcase,
  Globe,
  FileText,
  User,
  GraduationCap,
  Award,
  Target,
  TrendingUp,
  AlertCircle,
  Play,
  ExternalLink,
  Copy,
  Settings
} from 'lucide-react';

interface JobDetails {
  id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  city?: string;
  state?: string;
  location?: string;
  salary?: string;
  salaryMin?: string;
  salaryMax?: string;
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  level?: 'JUNIOR' | 'PLENO' | 'SENIOR' | 'LEAD';
  workMode?: 'REMOTE' | 'HYBRID' | 'ONSITE';
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'PAUSED';
  skills?: string;
  experienceYears?: string;
  education?: string;
  languages?: string;
  createdAt: string;
  updatedAt?: string;
  company: {
    name: string;
  };
  applications: Application[];
  _count: {
    applications: number;
  };
}

interface Application {
  id: string;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'HIRED' | 'REJECTED';
  createdAt: string;
  message?: string;
  candidate: {
    id: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    experience?: string;
    education?: string;
    skills?: string;
    profileVideoUrl?: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export default function JobDetails({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }

    fetchJobDetails();
  }, [session, status, router, resolvedParams.id]);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/company/jobs/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        console.error('Error fetching job details');
        router.push('/empresa/vagas');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      router.push('/empresa/vagas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/company/jobs/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/empresa/vagas');
      } else {
        alert('Erro ao excluir vaga');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Erro ao excluir vaga');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/company/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchJobDetails(); // Refresh data
      } else {
        alert('Erro ao atualizar status da candidatura');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Erro ao atualizar status da candidatura');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Ativa', className: 'bg-green-100 text-green-800' },
      DRAFT: { label: 'Rascunho', className: 'bg-gray-100 text-gray-800' },
      PAUSED: { label: 'Pausada', className: 'bg-yellow-100 text-yellow-800' },
      CLOSED: { label: 'Fechada', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getApplicationStatusBadge = (status: string) => {
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
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
        <Icon className="h-4 w-4 mr-1" />
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

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'JUNIOR':
        return 'Júnior';
      case 'PLENO':
        return 'Pleno';
      case 'SENIOR':
        return 'Sênior';
      case 'LEAD':
        return 'Lead';
      default:
        return level;
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

  const filteredApplications = job?.applications.filter(app => {
    const matchesSearch = app.candidate.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.candidate.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getApplicationStats = () => {
    if (!job) return { total: 0, applied: 0, screening: 0, interview: 0, hired: 0, rejected: 0 };
    
    const stats = job.applications.reduce((acc, app) => {
      acc.total++;
      acc[app.status.toLowerCase() as keyof typeof acc]++;
      return acc;
    }, { total: 0, applied: 0, screening: 0, interview: 0, hired: 0, rejected: 0 });

    return stats;
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Vaga não encontrada</h3>
          <p className="text-gray-600 mb-4">A vaga que você está procurando não existe ou foi removida.</p>
          <button
            onClick={() => router.push('/empresa/vagas')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar às Vagas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              {getStatusBadge(job.status)}
              <div className="flex items-center text-gray-600 text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                Criada em {formatDate(job.createdAt)}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Users className="h-4 w-4 mr-1" />
                {job._count.applications} candidatura(s)
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </button>
          <button
            onClick={() => router.push(`/empresa/vagas/${job.id}/editar`)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Candidatos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.applied}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Eye className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Triagem</p>
              <p className="text-2xl font-bold text-gray-900">{stats.screening}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Entrevistas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.interview}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Contratados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.hired}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejeitados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'applications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Candidaturas ({job._count.applications})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Job Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição da Vaga</h3>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      <p className="whitespace-pre-wrap">{job.description}</p>
                    </div>
                  </div>

                  {job.responsibilities && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsabilidades</h3>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        <p className="whitespace-pre-wrap">{job.responsibilities}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos</h3>
                    <div className="prose prose-sm max-w-none text-gray-600">
                      <p className="whitespace-pre-wrap">{job.requirements}</p>
                    </div>
                  </div>

                  {job.benefits && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefícios</h3>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        <p className="whitespace-pre-wrap">{job.benefits}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Job Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da Vaga</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-600">{job.location || `${job.city}, ${job.state}`}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-gray-600">{getTypeLabel(job.type)}</span>
                      </div>
                      {job.level && (
                        <div className="flex items-center">
                          <Target className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">{getLevelLabel(job.level)}</span>
                        </div>
                      )}
                      {job.workMode && (
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">{getWorkModeLabel(job.workMode)}</span>
                        </div>
                      )}
                      {(job.salaryMin || job.salaryMax || job.salary) && (
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">
                            {job.salary || `${job.salaryMin} - ${job.salaryMax}`}
                          </span>
                        </div>
                      )}
                      {job.experienceYears && (
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">{job.experienceYears} de experiência</span>
                        </div>
                      )}
                      {job.education && (
                        <div className="flex items-center">
                          <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-600">{job.education}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {job.skills && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Habilidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.split(',').map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {job.languages && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Idiomas</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.languages.split(',').map((language, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                          >
                            {language.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Buscar candidatos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Status</option>
                    <option value="APPLIED">Candidatou-se</option>
                    <option value="SCREENING">Triagem</option>
                    <option value="INTERVIEW">Entrevista</option>
                    <option value="HIRED">Contratado</option>
                    <option value="REJECTED">Rejeitado</option>
                  </select>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {job.applications.length === 0 ? 'Nenhuma candidatura ainda' : 'Nenhum resultado encontrado'}
                    </h3>
                    <p className="text-gray-600">
                      {job.applications.length === 0 
                        ? 'Quando alguém se candidatar a esta vaga, aparecerá aqui.'
                        : 'Tente ajustar os filtros para encontrar o que procura.'
                      }
                    </p>
                  </div>
                ) : (
                  filteredApplications.map((application) => (
                    <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {application.candidate.user.name}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {application.candidate.user.email}
                              </div>
                              {application.candidate.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {application.candidate.phone}
                                </div>
                              )}
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(application.createdAt)}
                              </div>
                            </div>
                            {application.candidate.city && application.candidate.state && (
                              <div className="flex items-center mt-1 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-1" />
                                {application.candidate.city}, {application.candidate.state}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getApplicationStatusBadge(application.status)}
                          <div className="relative">
                            <select
                              value={application.status}
                              onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="APPLIED">Candidatou-se</option>
                              <option value="SCREENING">Triagem</option>
                              <option value="INTERVIEW">Entrevista</option>
                              <option value="HIRED">Contratado</option>
                              <option value="REJECTED">Rejeitado</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {application.message && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-1">Carta de Apresentação</h5>
                            <p className="text-gray-600 text-sm">{application.message}</p>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {application.candidate.experience && (
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {application.candidate.experience}
                            </div>
                          )}
                          {application.candidate.education && (
                            <div className="flex items-center">
                              <GraduationCap className="h-4 w-4 mr-1" />
                              {application.candidate.education}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {application.candidate.profileVideoUrl && (
                            <button className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Play className="h-4 w-4 mr-1" />
                              Ver Vídeo
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/empresa/candidatos/${application.candidate.id}`)}
                            className="flex items-center px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ver Perfil
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Excluir Vaga</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita e todas as candidaturas serão perdidas.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}