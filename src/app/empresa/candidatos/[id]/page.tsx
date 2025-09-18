'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Award, 
  FileText, 
  Play, 
  Download,
  MessageCircle,
  Star,
  Clock,
  Building2,
  Target,
  Globe,
  Languages,
  Heart,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface CandidateProfile {
  id: string;
  phone?: string;
  city?: string;
  state?: string;
  dateOfBirth?: string;
  skills?: string;
  experience?: string;
  education?: string;
  description?: string;
  aboutMe?: string;
  profileVideoUrl?: string;
  languages?: string;
  user: {
    name: string;
    email: string;
  };
  applications: Array<{
    id: string;
    status: string;
    createdAt: string;
    message?: string;
    job: {
      id: string;
      title: string;
      company: {
        name: string;
      };
    };
  }>;
}

export default function CandidateProfile({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }

    fetchCandidateProfile();
  }, [session, status, router, resolvedParams.id]);

  const fetchCandidateProfile = async () => {
    try {
      const response = await fetch(`/api/company/candidates/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        setCandidate(data);
      } else {
        console.error('Error fetching candidate profile');
        router.push('/empresa/candidatos');
      }
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      router.push('/empresa/candidatos');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APPLIED: { label: 'Candidatou-se', className: 'bg-blue-100 text-blue-800' },
      SCREENING: { label: 'Triagem', className: 'bg-yellow-100 text-yellow-800' },
      INTERVIEW: { label: 'Entrevista', className: 'bg-purple-100 text-purple-800' },
      HIRED: { label: 'Contratado', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Rejeitado', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil do candidato...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Candidato não encontrado</h2>
          <p className="text-gray-600 mb-4">O perfil do candidato não foi encontrado ou você não tem permissão para visualizá-lo.</p>
          <button
            onClick={() => router.push('/empresa/candidatos')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Candidatos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </button>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{candidate.user.name}</h1>
                  <p className="text-gray-600">{candidate.user.email}</p>
                  {candidate.city && candidate.state && (
                    <div className="flex items-center text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {candidate.city}, {candidate.state}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {candidate.profileVideoUrl && (
                  <button className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Play className="h-4 w-4 mr-2" />
                    Ver Vídeo de Apresentação
                  </button>
                )}
                <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Perfil
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Candidaturas ({candidate.applications?.length || 0})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              {candidate.aboutMe && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Sobre</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{candidate.aboutMe}</p>
                </div>
              )}

              {/* Experience */}
              {candidate.experience && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Experiência
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{candidate.experience}</p>
                </div>
              )}

              {/* Education */}
              {candidate.education && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Educação
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{candidate.education}</p>
                </div>
              )}

              {/* Skills */}
              {candidate.skills && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Habilidades
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.split(',').map((skill, index) => (
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
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-700">{candidate.user.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{candidate.phone}</span>
                    </div>
                  )}
                  {candidate.city && candidate.state && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{candidate.city}, {candidate.state}</span>
                    </div>
                  )}
                  {candidate.dateOfBirth && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-700">{formatDate(candidate.dateOfBirth)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              {candidate.languages && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Idiomas
                  </h2>
                  <div className="space-y-2">
                    {candidate.languages.split(',').map((language, index) => (
                      <div key={index} className="text-gray-700">
                        {language.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Candidaturas</h2>
            </div>
            <div className="p-6">
              {candidate.applications && candidate.applications.length > 0 ? (
                <div className="space-y-4">
                  {candidate.applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{application.job.title}</h3>
                          <p className="text-sm text-gray-600">{application.job.company.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Candidatou-se em {formatDate(application.createdAt)}
                          </p>
                          {application.message && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">Carta de apresentação:</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {application.message}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(application.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma candidatura encontrada</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}