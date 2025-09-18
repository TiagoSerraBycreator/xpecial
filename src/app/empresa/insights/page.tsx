'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  MapPin,
  Star,
  Eye,
  UserCheck,
  Filter,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface CompanyInsights {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalViews: number;
  averageApplicationsPerJob: number;
  topPerformingJobs: Array<{
    id: string;
    title: string;
    applications: number;
    views: number;
  }>;
  applicationTrends: Array<{
    date: string;
    applications: number;
    views: number;
  }>;
  locationStats: Array<{
    location: string;
    count: number;
  }>;
  categoryStats: Array<{
    category: string;
    count: number;
    color: string;
  }>;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
}

function MetricCard({ title, value, change, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change >= 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function CompanyInsightsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [insights, setInsights] = useState<CompanyInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || session.user.role !== 'COMPANY') {
      router.push('/login');
      return;
    }

    fetchInsights();
  }, [session, status, router, selectedPeriod]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (session?.user && session.user.role === 'COMPANY') {
        fetchInsights();
      }
    }, 30000); // Atualiza a cada 30 segundos

    return () => clearInterval(interval);
  }, [session, selectedPeriod]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/empresa/insights?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar insights');
      }
      
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar insights:', error);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <button
            onClick={fetchInsights}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                Insights da Empresa
              </h1>
              <p className="mt-2 text-gray-600">
                Análise detalhada do desempenho das suas vagas e candidaturas
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              {/* Seletor de Período */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Últimos 7 dias</option>
                  <option value="30">Últimos 30 dias</option>
                  <option value="90">Últimos 90 dias</option>
                  <option value="365">Último ano</option>
                </select>
              </div>
              
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Vagas"
            value={insights.totalJobs}
            change={12}
            icon={Briefcase}
            color="bg-blue-500"
          />
          <MetricCard
            title="Vagas Ativas"
            value={insights.activeJobs}
            change={8}
            icon={Activity}
            color="bg-green-500"
          />
          <MetricCard
            title="Total de Candidaturas"
            value={insights.totalApplications}
            change={-3}
            icon={Users}
            color="bg-purple-500"
          />
          <MetricCard
            title="Visualizações"
            value={insights.totalViews.toLocaleString()}
            change={15}
            icon={Eye}
            color="bg-orange-500"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tendência de Candidaturas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              Tendência de Candidaturas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={insights.applicationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Candidaturas"
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Visualizações"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribuição por Categoria */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="h-5 w-5 text-blue-600 mr-2" />
              Vagas por Categoria
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={insights.categoryStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {insights.categoryStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vagas com Melhor Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="h-5 w-5 text-blue-600 mr-2" />
            Vagas com Melhor Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vaga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidaturas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visualizações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Taxa de Conversão
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {insights.topPerformingJobs.map((job) => {
                  const conversionRate = job.views > 0 ? ((job.applications / job.views) * 100).toFixed(1) : '0';
                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.applications}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.views}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{conversionRate}%</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estatísticas por Localização */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            Candidaturas por Localização
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights.locationStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}