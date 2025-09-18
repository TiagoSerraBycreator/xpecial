'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Filter,
  Eye,
  Send,
  ChevronDown,
  Bookmark,
  BookmarkCheck,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  ExternalLink,
  Briefcase,
  Globe,
  Home,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  X,
  Plus,
  Minus,
  RotateCcw,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  ThumbsUp,
  MessageSquare,
  Layers,
  Code,
  Palette,
  Database,
  Shield,
  Smartphone,
  Monitor,
  Settings,
  Cpu,
  Cloud,
  GitBranch
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  city?: string;
  state?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  workMode: 'remote' | 'hybrid' | 'onsite';
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  level: 'junior' | 'mid' | 'senior' | 'lead';
  status: string;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logo?: string;
    description?: string;
    size?: string;
    industry?: string;
  };
  skills: string[];
  benefits: string[];
  isBookmarked?: boolean;
  isApplied?: boolean;
  applicationsCount?: number;
  viewsCount?: number;
  matchScore?: number;
}

interface JobsResponse {
  jobs: Job[];
  totalPages: number;
  currentPage: number;
  totalJobs: number;
  filters: {
    cities: string[];
    companies: string[];
    skills: string[];
    workModes: string[];
    types: string[];
    levels: string[];
  };
}

export default function CandidateJobs() {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [salaryMinFilter, setSalaryMinFilter] = useState('');
  const [salaryMaxFilter, setSalaryMaxFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    cities: [] as string[],
    companies: [] as string[],
    skills: [] as string[],
    workModes: [] as string[],
    types: [] as string[],
    levels: [] as string[]
  });

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm, locationFilter, workModeFilter, typeFilter, levelFilter, salaryMinFilter, salaryMaxFilter, skillsFilter, sortBy]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      // Construir parâmetros da URL
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (locationFilter) params.append('location', locationFilter);
      if (workModeFilter) params.append('workMode', workModeFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (levelFilter) params.append('level', levelFilter);
      if (salaryMinFilter) params.append('salaryMin', salaryMinFilter);
      if (salaryMaxFilter) params.append('salaryMax', salaryMaxFilter);
      if (skillsFilter.length > 0) params.append('skills', skillsFilter.join(','));
      if (sortBy) params.append('sortBy', sortBy);

      const response = await fetch(`/api/candidate/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar vagas');
      }

      const data = await response.json();
      
      // Verificar se os dados existem antes de mapear
      if (!data || !data.jobs) {
        throw new Error('Dados de vagas não encontrados');
      }
      
      // Mapear os dados da API para o formato esperado pelo frontend
      const mappedJobs: Job[] = data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements || '',
        location: job.city && job.state ? `${job.city}, ${job.state}` : job.city || job.state || 'Remoto',
        city: job.city,
        state: job.state,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        workMode: job.workMode || 'remote',
        type: job.type || 'full-time',
        level: job.level || 'mid',
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        company: {
          id: job.company?.id || '',
          name: job.company?.name || 'Empresa',
          logo: job.company?.logo,
          description: job.company?.description,
          size: job.company?.size,
          industry: job.company?.industry
        },
        skills: job.skills ? job.skills.split(',').map((s: string) => s.trim()) : [],
        benefits: job.benefits ? job.benefits.split(',').map((b: string) => b.trim()) : [],
        isBookmarked: false, // TODO: Implementar sistema de favoritos
        isApplied: false, // TODO: Verificar se já se candidatou
        applicationsCount: job._count?.applications || 0,
        viewsCount: 0, // TODO: Implementar sistema de visualizações
        matchScore: Math.floor(Math.random() * 30) + 70 // TODO: Implementar algoritmo de match real
      }));

      setJobs(mappedJobs);
      setTotalJobs(data.totalCount || mappedJobs.length);
      setTotalPages(data.totalPages || 1);
      
      // Filtros disponíveis (pode ser expandido com dados reais da API)
      const mockFilters = {
        cities: data.filters?.cities || ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Porto Alegre'],
        companies: data.filters?.companies || [...new Set(mappedJobs.map(job => job.company.name))],
        skills: data.filters?.skills || ['React', 'Node.js', 'TypeScript', 'JavaScript', 'Python', 'Java', 'AWS', 'Docker'],
        workModes: data.filters?.workModes || ['remote', 'hybrid', 'onsite'],
        types: data.filters?.types || ['full-time', 'part-time', 'contract', 'internship'],
        levels: data.filters?.levels || ['junior', 'mid', 'senior', 'lead']
      };
      
      setAvailableFilters(mockFilters);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      setLoading(false);
    }
  };

  const getWorkModeInfo = (mode: string) => {
    const modeMap = {
      remote: { label: 'Remoto', icon: Home, color: 'text-green-600 bg-green-50' },
      hybrid: { label: 'Híbrido', icon: Globe, color: 'text-blue-600 bg-blue-50' },
      onsite: { label: 'Presencial', icon: Building2, color: 'text-gray-600 bg-gray-50' }
    };
    return modeMap[mode as keyof typeof modeMap] || modeMap.remote;
  };

  const getTypeInfo = (type: string) => {
    const typeMap = {
      'full-time': { label: 'Tempo Integral', color: 'text-blue-600' },
      'part-time': { label: 'Meio Período', color: 'text-purple-600' },
      contract: { label: 'Contrato', color: 'text-orange-600' },
      internship: { label: 'Estágio', color: 'text-green-600' }
    };
    return typeMap[type as keyof typeof typeMap] || typeMap['full-time'];
  };

  const getLevelInfo = (level: string) => {
    const levelMap = {
      junior: { label: 'Júnior', color: 'text-green-600' },
      mid: { label: 'Pleno', color: 'text-blue-600' },
      senior: { label: 'Sênior', color: 'text-purple-600' },
      lead: { label: 'Lead', color: 'text-red-600' }
    };
    return levelMap[level as keyof typeof levelMap] || levelMap.junior;
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salário não informado';
    if (min && max) return `R$ ${min.toLocaleString()} - R$ ${max.toLocaleString()}`;
    if (min) return `A partir de R$ ${min.toLocaleString()}`;
    return `Até R$ ${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const handleBookmark = async (jobId: string) => {
    try {
      setJobs(jobs.map(job => 
        job.id === jobId 
          ? { ...job, isBookmarked: !job.isBookmarked }
          : job
      ));
    } catch (error) {
      console.error('Erro ao favoritar vaga:', error);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      router.push(`/candidato/vagas/${jobId}/candidatar`);
    } catch (error) {
      console.error('Erro ao candidatar-se:', error);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setWorkModeFilter('');
    setTypeFilter('');
    setLevelFilter('');
    setSalaryMinFilter('');
    setSalaryMaxFilter('');
    setSkillsFilter([]);
    setCurrentPage(1);
  };

  // A API já faz a filtragem e ordenação, então usamos os jobs diretamente
  const displayJobs = jobs;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando vagas...</p>
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
                  Vagas Disponíveis
                </h1>
                <p className="text-gray-600 mt-1">
                  {totalJobs} vagas encontradas • Encontre sua próxima oportunidade
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
                  onClick={() => fetchJobs()}
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
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 mb-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por vaga, empresa ou palavra-chave..."
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
                <option value="oldest">Mais antigas</option>
                <option value="match">Melhor match</option>
                <option value="salary-high">Maior salário</option>
                <option value="salary-low">Menor salário</option>
                <option value="company">Por empresa</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input
                  type="text"
                  placeholder="Cidade ou estado"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                <select
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="remote">Remoto</option>
                  <option value="hybrid">Híbrido</option>
                  <option value="onsite">Presencial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="full-time">Tempo Integral</option>
                  <option value="part-time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="internship">Estágio</option>
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
                  <option value="junior">Júnior</option>
                  <option value="mid">Pleno</option>
                  <option value="senior">Sênior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              
              <div className="md:col-span-2 lg:col-span-4 flex justify-end">
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

        {/* Jobs List */}
        {displayJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma vaga encontrada</h3>
            <p className="text-gray-500 mb-6">
              Tente ajustar os filtros de busca ou explore outras oportunidades.
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
            {displayJobs.map((job) => {
              const workModeInfo = getWorkModeInfo(job.workMode);
              const typeInfo = getTypeInfo(job.type);
              const levelInfo = getLevelInfo(job.level);
              const WorkModeIcon = workModeInfo.icon;

              return (
                <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company.name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {job.matchScore && (
                          <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <Target className="h-3 w-3" />
                            <span>{job.matchScore}% match</span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleBookmark(job.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            job.isBookmarked 
                              ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {job.isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {job.location || 'Localização não informada'}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className={`flex items-center px-2 py-1 rounded-full ${workModeInfo.color}`}>
                          <WorkModeIcon className="h-3 w-3 mr-1" />
                          <span className="font-medium">{workModeInfo.label}</span>
                        </div>
                        
                        <span className={`font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span className={`font-medium ${levelInfo.color}`}>{levelInfo.label}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{job.skills.length - 3} mais
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{job.applicationsCount} candidatos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/candidato/vagas/${job.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Ver detalhes
                        </button>
                        
                        {job.isApplied ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                            Candidatado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(job.id)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Candidatar-se
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
              Mostrando {((currentPage - 1) * 10) + 1} a {Math.min(currentPage * 10, totalJobs)} de {totalJobs} vagas
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