'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, Globe, Calendar, Users, Briefcase, ExternalLink } from 'lucide-react';
import JobFilters from '@/components/public/JobFilters';
import JobCard from '@/components/public/JobCard';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  sector?: string;
  description?: string;
  website?: string;
  createdAt: string;
  stats: {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  workMode: string;
  salaryRange?: string;
  sector?: string;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface JobsResponse {
  jobs: Job[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    period: string;
    appliedFilters: {
      period: string | null;
      startDate: string | null;
    };
  };
}

export default function CompanyPublicProfile() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar dados da empresa
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/company/${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao carregar dados da empresa');
        }
        
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCompanyData();
    }
  }, [slug]);

  // Carregar vagas da empresa
  useEffect(() => {
    const fetchJobs = async () => {
      if (!company) return;
      
      try {
        setJobsLoading(true);
        const response = await fetch(
          `/api/public/company/${slug}/jobs?period=${selectedPeriod}&page=${currentPage}&limit=10`
        );
        
        if (!response.ok) {
          throw new Error('Erro ao carregar vagas');
        }
        
        const data: JobsResponse = await response.json();
        setJobs(data.jobs || []);
        setPagination(data.pagination || {
          total: 0,
          totalPages: 1,
          currentPage: 1,
          limit: 10,
          hasNext: false,
          hasPrev: false
        });
      } catch (err) {
        console.error('Erro ao carregar vagas:', err);
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, [company, slug, selectedPeriod, currentPage]);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setCurrentPage(1); // Reset para primeira página
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {error || 'Empresa não encontrada'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                A empresa que você está procurando não existe ou não está disponível publicamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da empresa */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start space-x-6">
            {/* Logo da empresa */}
            <div className="flex-shrink-0">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={`Logo da ${company.name}`}
                  className="h-20 w-20 rounded-lg object-cover border"
                />
              ) : (
                <div className="h-20 w-20 rounded-lg bg-gray-200 flex items-center justify-center border">
                  <Building2 className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Informações da empresa */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {company.sector && (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    <span>{company.sector}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Desde {formatDate(company.createdAt)}</span>
                </div>
                
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    <span>Website</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                )}
              </div>
              
              {company.description && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {company.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vagas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{company.stats.activeJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Vagas</p>
                  <p className="text-2xl font-bold text-gray-900">{company.stats.totalJobs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Candidaturas</p>
                  <p className="text-2xl font-bold text-gray-900">{company.stats.totalApplications}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Seção de vagas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vagas Disponíveis</span>
              <Badge variant="secondary">
                {pagination?.total || 0} {pagination?.total === 1 ? 'vaga' : 'vagas'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <JobFilters
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
            />
            
            <Separator className="my-6" />
            
            {/* Lista de vagas */}
            {jobsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                
                {/* Paginação */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      Anterior
                    </Button>
                    
                    <span className="text-sm text-gray-600">
                      Página {pagination.currentPage} de {pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhuma vaga encontrada
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedPeriod === 'all' 
                    ? 'Esta empresa não possui vagas ativas no momento.'
                    : 'Não há vagas para o período selecionado. Tente outro filtro.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}