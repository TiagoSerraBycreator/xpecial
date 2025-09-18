'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building2, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Briefcase, 
  GraduationCap,
  Download,
  Star,
  MessageCircle,
  FileText,
  Play,
  ExternalLink,
  MoreVertical,
  TrendingUp,
  Award,
  Target,
  Globe,
  DollarSign,
  Users,
  AlertCircle,
  ChevronDown,
  SortAsc,
  SortDesc,
  RefreshCw,
  Settings,
  Bookmark,
  Share2
} from 'lucide-react';

interface Application {
  id: string;
  status: 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'HIRED' | 'REJECTED';
  createdAt: string;
  message?: string;
  whatsapp?: string;
  consent: boolean;
  job: {
    id: string;
    title: string;
    location?: string;
    city?: string;
    state?: string;
    salaryMin?: number;
    salaryMax?: number;
    workMode: string;
    type: string;
    level?: string;
  };
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

interface ApplicationsResponse {
  applications: Application[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export default function CompanyCandidates() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedApplications, setSelectedApplications] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }

    fetchApplications();
    fetchJobs();
  }, [session, status, router, currentPage, statusFilter, jobFilter, sortBy, sortOrder]);

  const fetchApplications = async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter === 'all' ? 'ALL' : statusFilter,
        jobId: jobFilter === 'all' ? 'ALL' : jobFilter,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/company/applications?${params}`);
      if (response.ok) {
        const data: ApplicationsResponse = await response.json();
        setApplications(data.applications);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else {
        const errorData = await response.text();
        console.error('Error fetching applications:', response.status, response.statusText, errorData);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/company/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
        fetchApplications();
      } else {
        alert('Erro ao atualizar status da candidatura');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Erro ao atualizar status da candidatura');
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      const promises = Array.from(selectedApplications).map(id =>
        fetch(`/api/company/applications/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        })
      );

      await Promise.all(promises);
      setSelectedApplications(new Set());
      setShowBulkActions(false);
      fetchApplications();
    } catch (error) {
      console.error('Error updating applications:', error);
      alert('Erro ao atualizar candidaturas');
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchApplications();
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

  const getApplicationStats = () => {
    const stats = applications.reduce((acc, app) => {
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          <p className="text-gray-600 mt-1">Gerencie todas as candidaturas recebidas</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchApplications();
            }}
            disabled={refreshing}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="h-4 w-4 mr-2" />
            Exportar
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
              <p className="text-2xl font-bold text-gray-900">{total}</p>
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

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou habilidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="APPLIED">Candidatou-se</option>
              <option value="SCREENING">Triagem</option>
              <option value="INTERVIEW">Entrevista</option>
              <option value="HIRED">Contratado</option>
              <option value="REJECTED">Rejeitado</option>
            </select>

            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as Vagas</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt-desc">Mais Recentes</option>
              <option value="createdAt-asc">Mais Antigos</option>
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
            </select>

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApplications.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-900 font-medium">
                {selectedApplications.size} candidatura(s) selecionada(s)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkStatusUpdate('SCREENING')}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                Mover para Triagem
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('INTERVIEW')}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
              >
                Mover para Entrevista
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('REJECTED')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
              >
                Rejeitar
              </button>
              <button
                onClick={() => setSelectedApplications(new Set())}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma candidatura encontrada</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || jobFilter !== 'all'
                ? 'Tente ajustar os filtros para encontrar candidaturas.'
                : 'Quando alguém se candidatar às suas vagas, aparecerá aqui.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedApplications.has(application.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedApplications);
                        if (e.target.checked) {
                          newSelected.add(application.id);
                        } else {
                          newSelected.delete(application.id);
                        }
                        setSelectedApplications(newSelected);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.candidate.user.name}
                        </h3>
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
                        
                        {/* Job Info */}
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{application.job.title}</h4>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  {application.job.location || `${application.job.city}, ${application.job.state}`}
                                </div>
                                <div className="flex items-center">
                                  <Briefcase className="h-4 w-4 mr-1" />
                                  {getTypeLabel(application.job.type)}
                                </div>
                                <div className="flex items-center">
                                  <Globe className="h-4 w-4 mr-1" />
                                  {getWorkModeLabel(application.job.workMode)}
                                </div>
                                {formatSalary(application.job.salaryMin, application.job.salaryMax) && (
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    {formatSalary(application.job.salaryMin, application.job.salaryMax)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => router.push(`/empresa/vagas/${application.job.id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver Vaga
                            </button>
                          </div>
                        </div>

                        {/* Candidate Info */}
                        <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                          {application.candidate.city && application.candidate.state && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {application.candidate.city}, {application.candidate.state}
                            </div>
                          )}
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

                        {/* Cover Letter */}
                        {application.message && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-gray-900 mb-1">Carta de Apresentação</h5>
                            <p className="text-gray-600 text-sm line-clamp-2">{application.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 ml-4">
                        {getStatusBadge(application.status)}
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

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {application.candidate.skills && (
                          <div className="flex flex-wrap gap-1">
                            {application.candidate.skills.split(',').slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                            {application.candidate.skills.split(',').length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{application.candidate.skills.split(',').length - 3}
                              </span>
                            )}
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
                        <button className="flex items-center px-3 py-1 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Contatar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, total)} de {total} candidaturas
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}