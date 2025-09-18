'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Award,
  Download,
  Eye,
  Calendar,
  Building2,
  Star,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Share2,
  ExternalLink,
  CheckCircle,
  Clock,
  Trophy,
  Medal,
  BookOpen,
  Target,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Shield,
  Code,
  Palette,
  Database,
  Smartphone,
  Monitor,
  Settings,
  Cpu,
  Cloud,
  GitBranch,
  MoreVertical,
  FileText,
  Link as LinkIcon,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuer: string;
  issuerLogo?: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
  category: 'technical' | 'soft-skills' | 'language' | 'certification' | 'course';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  status: 'active' | 'expired' | 'pending';
  hours?: number;
  score?: number;
  isVerified: boolean;
  downloadUrl?: string;
}

interface CertificatesResponse {
  certificates: Certificate[];
  totalPages: number;
  currentPage: number;
  totalCertificates: number;
  stats: {
    total: number;
    active: number;
    expired: number;
    pending: number;
    verified: number;
  };
}

export default function CertificatesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    pending: 0,
    verified: 0
  });

  useEffect(() => {
    fetchCertificates();
  }, [currentPage, searchTerm, categoryFilter, levelFilter, statusFilter, sortBy]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockCertificates: Certificate[] = [
        {
          id: '1',
          title: 'React Developer Certification',
          description: 'Certificação completa em desenvolvimento React, incluindo hooks, context API, e melhores práticas.',
          issuer: 'Meta',
          issuerLogo: '/issuers/meta.png',
          issueDate: '2024-01-15T00:00:00Z',
          expiryDate: '2026-01-15T00:00:00Z',
          credentialId: 'META-REACT-2024-001',
          credentialUrl: 'https://developers.facebook.com/certificate/verify/META-REACT-2024-001',
          skills: ['React', 'JavaScript', 'JSX', 'Hooks', 'Context API'],
          category: 'technical',
          level: 'advanced',
          status: 'active',
          hours: 40,
          score: 95,
          isVerified: true,
          downloadUrl: '/certificates/react-cert.pdf'
        },
        {
          id: '2',
          title: 'AWS Cloud Practitioner',
          description: 'Certificação fundamental da AWS cobrindo conceitos básicos de cloud computing.',
          issuer: 'Amazon Web Services',
          issuerLogo: '/issuers/aws.png',
          issueDate: '2023-11-20T00:00:00Z',
          expiryDate: '2026-11-20T00:00:00Z',
          credentialId: 'AWS-CP-2023-789',
          credentialUrl: 'https://aws.amazon.com/verification',
          skills: ['AWS', 'Cloud Computing', 'EC2', 'S3', 'IAM'],
          category: 'certification',
          level: 'beginner',
          status: 'active',
          hours: 60,
          score: 88,
          isVerified: true,
          downloadUrl: '/certificates/aws-cp.pdf'
        },
        {
          id: '3',
          title: 'TypeScript Fundamentals',
          description: 'Curso completo sobre TypeScript, tipos, interfaces e programação orientada a objetos.',
          issuer: 'Microsoft Learn',
          issuerLogo: '/issuers/microsoft.png',
          issueDate: '2023-09-10T00:00:00Z',
          credentialId: 'MS-TS-2023-456',
          skills: ['TypeScript', 'JavaScript', 'Types', 'Interfaces', 'OOP'],
          category: 'course',
          level: 'intermediate',
          status: 'active',
          hours: 25,
          score: 92,
          isVerified: true,
          downloadUrl: '/certificates/typescript.pdf'
        },
        {
          id: '4',
          title: 'Agile Project Management',
          description: 'Certificação em metodologias ágeis, Scrum e Kanban para gestão de projetos.',
          issuer: 'Scrum Alliance',
          issuerLogo: '/issuers/scrum-alliance.png',
          issueDate: '2023-07-05T00:00:00Z',
          expiryDate: '2025-07-05T00:00:00Z',
          credentialId: 'SA-APM-2023-123',
          credentialUrl: 'https://scrumalliance.org/verify',
          skills: ['Scrum', 'Agile', 'Kanban', 'Project Management', 'Leadership'],
          category: 'soft-skills',
          level: 'intermediate',
          status: 'active',
          hours: 35,
          score: 90,
          isVerified: true,
          downloadUrl: '/certificates/agile-pm.pdf'
        },
        {
          id: '5',
          title: 'English Proficiency - C1',
          description: 'Certificado de proficiência em inglês nível C1 (avançado).',
          issuer: 'Cambridge English',
          issuerLogo: '/issuers/cambridge.png',
          issueDate: '2023-03-15T00:00:00Z',
          credentialId: 'CAM-ENG-C1-2023-999',
          skills: ['English', 'Communication', 'Writing', 'Speaking', 'Listening'],
          category: 'language',
          level: 'advanced',
          status: 'active',
          hours: 120,
          score: 85,
          isVerified: true,
          downloadUrl: '/certificates/english-c1.pdf'
        },
        {
          id: '6',
          title: 'Docker Containerization',
          description: 'Curso sobre containerização com Docker, incluindo Docker Compose e orquestração.',
          issuer: 'Docker Inc.',
          issuerLogo: '/issuers/docker.png',
          issueDate: '2024-01-30T00:00:00Z',
          credentialId: 'DOCKER-2024-555',
          skills: ['Docker', 'Containers', 'DevOps', 'Kubernetes', 'CI/CD'],
          category: 'technical',
          level: 'intermediate',
          status: 'pending',
          hours: 30,
          isVerified: false
        }
      ];

      const mockStats = {
        total: mockCertificates.length,
        active: mockCertificates.filter(c => c.status === 'active').length,
        expired: mockCertificates.filter(c => c.status === 'expired').length,
        pending: mockCertificates.filter(c => c.status === 'pending').length,
        verified: mockCertificates.filter(c => c.isVerified).length
      };

      setCertificates(mockCertificates);
      setStats(mockStats);
      setTotalCertificates(mockCertificates.length);
      setTotalPages(1);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar certificados:', error);
      setLoading(false);
    }
  };

  const getCategoryInfo = (category: string) => {
    const categoryMap = {
      technical: { label: 'Técnico', icon: Code, color: 'text-blue-600 bg-blue-50' },
      'soft-skills': { label: 'Soft Skills', icon: Users, color: 'text-purple-600 bg-purple-50' },
      language: { label: 'Idiomas', icon: Globe, color: 'text-green-600 bg-green-50' },
      certification: { label: 'Certificação', icon: Shield, color: 'text-red-600 bg-red-50' },
      course: { label: 'Curso', icon: BookOpen, color: 'text-orange-600 bg-orange-50' }
    };
    return categoryMap[category as keyof typeof categoryMap] || categoryMap.technical;
  };

  const getLevelInfo = (level: string) => {
    const levelMap = {
      beginner: { label: 'Iniciante', color: 'text-green-600' },
      intermediate: { label: 'Intermediário', color: 'text-blue-600' },
      advanced: { label: 'Avançado', color: 'text-purple-600' },
      expert: { label: 'Expert', color: 'text-red-600' }
    };
    return levelMap[level as keyof typeof levelMap] || levelMap.beginner;
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      active: { label: 'Ativo', color: 'text-green-600 bg-green-50', icon: CheckCircle },
      expired: { label: 'Expirado', color: 'text-red-600 bg-red-50', icon: AlertCircle },
      pending: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50', icon: Clock }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.active;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const handleDownload = async (certificate: Certificate) => {
    if (certificate.downloadUrl) {
      // Simular download
      console.log('Downloading certificate:', certificate.title);
    }
  };

  const handleShare = async (certificate: Certificate) => {
    if (certificate.credentialUrl) {
      try {
        await navigator.share({
          title: certificate.title,
          text: `Confira meu certificado: ${certificate.title}`,
          url: certificate.credentialUrl
        });
      } catch (error) {
        // Fallback para copiar URL
        navigator.clipboard.writeText(certificate.credentialUrl);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setLevelFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || cert.category === categoryFilter;
    const matchesLevel = !levelFilter || cert.level === levelFilter;
    const matchesStatus = !statusFilter || cert.status === statusFilter;

    return matchesSearch && matchesCategory && matchesLevel && matchesStatus;
  });

  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
      case 'oldest':
        return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'issuer':
        return a.issuer.localeCompare(b.issuer);
      case 'score':
        return (b.score || 0) - (a.score || 0);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando certificados...</p>
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
                  <Award className="h-8 w-8 mr-3 text-blue-600" />
                  Meus Certificados
                </h1>
                <p className="text-gray-600 mt-1">
                  {totalCertificates} certificados • Gerencie suas conquistas e qualificações
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {viewMode === 'list' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
                
                <button
                  onClick={() => fetchCertificates()}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verificados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por certificado, emissor ou habilidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtros</span>
              </button>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="title">Por título</option>
                <option value="issuer">Por emissor</option>
                <option value="score">Por pontuação</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="technical">Técnico</option>
                  <option value="soft-skills">Soft Skills</option>
                  <option value="language">Idiomas</option>
                  <option value="certification">Certificação</option>
                  <option value="course">Curso</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="beginner">Iniciante</option>
                  <option value="intermediate">Intermediário</option>
                  <option value="advanced">Avançado</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="expired">Expirado</option>
                  <option value="pending">Pendente</option>
                </select>
              </div>
              
              <div className="md:col-span-3 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Limpar filtros</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Certificates List */}
        {sortedCertificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum certificado encontrado</h3>
            <p className="text-gray-500 mb-6">
              Tente ajustar os filtros de busca ou adicione novos certificados.
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedCertificates.map((certificate) => {
              const categoryInfo = getCategoryInfo(certificate.category);
              const levelInfo = getLevelInfo(certificate.level);
              const statusInfo = getStatusInfo(certificate.status);
              const CategoryIcon = categoryInfo.icon;
              const StatusIcon = statusInfo.icon;

              return (
                <div key={certificate.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <CategoryIcon className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{certificate.title}</h3>
                          <p className="text-sm text-gray-600">{certificate.issuer}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {certificate.isVerified && (
                          <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Shield className="h-3 w-3" />
                            <span>Verificado</span>
                          </div>
                        )}
                        
                        {isExpiringSoon(certificate.expiryDate) && (
                          <div className="flex items-center space-x-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            <AlertCircle className="h-3 w-3" />
                            <span>Expira em breve</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className={`flex items-center px-2 py-1 rounded-full ${categoryInfo.color}`}>
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          <span className="font-medium">{categoryInfo.label}</span>
                        </div>
                        
                        <span className={`font-medium ${levelInfo.color}`}>{levelInfo.label}</span>
                        
                        <div className={`flex items-center px-2 py-1 rounded-full ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          <span className="font-medium">{statusInfo.label}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Emitido em {formatDate(certificate.issueDate)}
                        {certificate.expiryDate && (
                          <span className="ml-2">• Expira em {formatDate(certificate.expiryDate)}</span>
                        )}
                      </div>
                      
                      {certificate.hours && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {certificate.hours} horas de duração
                        </div>
                      )}
                      
                      {certificate.score && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 mr-2" />
                          Pontuação: {certificate.score}%
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {certificate.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {certificate.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {certificate.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{certificate.skills.length - 3} mais
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        {certificate.credentialId && (
                          <span>ID: {certificate.credentialId}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {certificate.credentialUrl && (
                          <button
                            onClick={() => window.open(certificate.credentialUrl, '_blank')}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Verificar credencial"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                        
                        {certificate.credentialUrl && (
                          <button
                            onClick={() => handleShare(certificate)}
                            className="text-gray-600 hover:text-gray-700 p-1"
                            title="Compartilhar"
                          >
                            <Share2 className="h-4 w-4" />
                          </button>
                        )}
                        
                        {certificate.downloadUrl && (
                          <button
                            onClick={() => handleDownload(certificate)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </button>
                        )}
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
              Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, sortedCertificates.length)} de {sortedCertificates.length} certificados
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