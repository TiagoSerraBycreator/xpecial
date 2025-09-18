'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Target,
  Award,
  Briefcase,
  Calendar,
  Clock,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface InsightsData {
  totalApplications: number;
  acceptedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  profileViews: number;
  successRate: number;
  averageResponseTime: number;
  certificatesEarned: number;
  skillsImproved: number;
  coursesCompleted: number;
  previousPeriod: {
    totalApplications: number;
    acceptedApplications: number;
    profileViews: number;
    successRate: number;
  };
}

interface ChartData {
  month: string;
  applications: number;
  accepted: number;
  views: number;
}

interface SkillProgress {
  skill: string;
  current: number;
  target: number;
  improvement: number;
}

interface RecommendationCard {
  id: string;
  type: 'skill' | 'course' | 'job' | 'profile';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
}

export default function InsightsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/candidate/insights');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados de insights');
        }
        
        const data = await response.json();
        
        // Transformar dados da API para o formato esperado pela interface
        const transformedInsights: InsightsData = {
          totalApplications: data.metrics.current.totalApplications,
          acceptedApplications: data.metrics.current.acceptedApplications,
          pendingApplications: data.metrics.current.pendingApplications,
          rejectedApplications: data.metrics.current.rejectedApplications,
          profileViews: 0, // Não disponível na API atual
          successRate: data.metrics.current.totalApplications > 0 
            ? (data.metrics.current.acceptedApplications / data.metrics.current.totalApplications) * 100 
            : 0,
          averageResponseTime: 0, // Não disponível na API atual
          certificatesEarned: data.metrics.current.certificatesEarned,
          skillsImproved: 0, // Não disponível na API atual
          coursesCompleted: 0, // Não disponível na API atual
          previousPeriod: {
            totalApplications: data.metrics.previous.totalApplications,
            acceptedApplications: data.metrics.previous.acceptedApplications,
            profileViews: 0,
            successRate: data.metrics.previous.totalApplications > 0 
              ? (data.metrics.previous.acceptedApplications / data.metrics.previous.totalApplications) * 100 
              : 0
          }
        };

        // Transformar dados do gráfico
        const transformedChartData: ChartData[] = data.chartData.monthly.map((item: any) => ({
          month: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
          applications: item.total,
          accepted: item.accepted,
          views: 0 // Não disponível
        }));

        // Dados mockados para habilidades (não disponível na API atual)
        const mockSkillProgress: SkillProgress[] = [
          { skill: 'React', current: 85, target: 90, improvement: 15 },
          { skill: 'Node.js', current: 70, target: 80, improvement: 10 },
          { skill: 'TypeScript', current: 60, target: 75, improvement: 20 },
          { skill: 'Python', current: 45, target: 60, improvement: 25 },
        ];

        // Gerar recomendações baseadas nos dados reais
        const generateRecommendations = (insights: InsightsData): RecommendationCard[] => {
          const recommendations: RecommendationCard[] = [];
          
          if (insights.successRate < 20) {
            recommendations.push({
              id: '1',
              type: 'profile',
              title: 'Melhore seu perfil',
              description: 'Sua taxa de sucesso está baixa. Complete seu perfil para aumentar suas chances.',
              priority: 'high',
              action: 'Completar perfil'
            });
          }
          
          if (insights.totalApplications < 5) {
            recommendations.push({
              id: '2',
              type: 'job',
              title: 'Candidate-se a mais vagas',
              description: 'Aumente suas chances se candidatando a mais oportunidades.',
              priority: 'medium',
              action: 'Ver vagas'
            });
          }
          
          if (insights.certificatesEarned === 0) {
            recommendations.push({
              id: '3',
              type: 'course',
              title: 'Obtenha certificações',
              description: 'Certificações podem aumentar significativamente suas chances.',
              priority: 'medium',
              action: 'Ver cursos'
            });
          }
          
          return recommendations;
        };

        setInsights(transformedInsights);
        setChartData(transformedChartData);
        setSkillProgress(mockSkillProgress);
        setRecommendations(generateRecommendations(transformedInsights));
        
      } catch (error) {
        console.error('Erro ao buscar insights:', error);
        // Em caso de erro, usar dados mockados como fallback
        const fallbackInsights: InsightsData = {
          totalApplications: 0,
          acceptedApplications: 0,
          pendingApplications: 0,
          rejectedApplications: 0,
          profileViews: 0,
          successRate: 0,
          averageResponseTime: 0,
          certificatesEarned: 0,
          skillsImproved: 0,
          coursesCompleted: 0,
          previousPeriod: {
            totalApplications: 0,
            acceptedApplications: 0,
            profileViews: 0,
            successRate: 0
          }
        };
        setInsights(fallbackInsights);
        setChartData([]);
        setSkillProgress([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [selectedPeriod]);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-8 w-8 mr-3 text-blue-600" />
                  Insights de Carreira
                </h1>
                <p className="text-gray-600 mt-1">Analise seu desempenho e descubra oportunidades de melhoria</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                </select>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Candidaturas</p>
                <p className="text-2xl font-bold text-gray-900">{insights.totalApplications}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(calculateChange(insights.totalApplications, insights.previousPeriod.totalApplications))}
              <span className={`text-sm font-medium ml-1 ${getChangeColor(calculateChange(insights.totalApplications, insights.previousPeriod.totalApplications))}`}>
                {Math.abs(calculateChange(insights.totalApplications, insights.previousPeriod.totalApplications)).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">{insights.successRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(calculateChange(insights.successRate, insights.previousPeriod.successRate))}
              <span className={`text-sm font-medium ml-1 ${getChangeColor(calculateChange(insights.successRate, insights.previousPeriod.successRate))}`}>
                {Math.abs(calculateChange(insights.successRate, insights.previousPeriod.successRate)).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">{insights.profileViews}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {getChangeIcon(calculateChange(insights.profileViews, insights.previousPeriod.profileViews))}
              <span className={`text-sm font-medium ml-1 ${getChangeColor(calculateChange(insights.profileViews, insights.previousPeriod.profileViews))}`}>
                {Math.abs(calculateChange(insights.profileViews, insights.previousPeriod.profileViews)).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificados</p>
                <p className="text-2xl font-bold text-gray-900">{insights.certificatesEarned}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500">+{insights.coursesCompleted} cursos concluídos</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Status Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Status das Candidaturas</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{insights.acceptedApplications}</div>
                  <div className="text-sm text-gray-500">Aceitas</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{insights.pendingApplications}</div>
                  <div className="text-sm text-gray-500">Pendentes</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{insights.rejectedApplications}</div>
                  <div className="text-sm text-gray-500">Rejeitadas</div>
                </div>
              </div>

              {/* Simple chart representation */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">Aceitas</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(insights.acceptedApplications / insights.totalApplications) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 font-medium">{insights.acceptedApplications}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">Pendentes</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(insights.pendingApplications / insights.totalApplications) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 font-medium">{insights.pendingApplications}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600">Rejeitadas</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(insights.rejectedApplications / insights.totalApplications) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-12 text-sm text-gray-900 font-medium">{insights.rejectedApplications}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recomendações</h3>
              
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{rec.title}</h4>
                      {getPriorityIcon(rec.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                    <button className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                      {rec.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Progress */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Progresso das Habilidades</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skillProgress.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{skill.skill}</span>
                    <span className="text-sm text-gray-500">{skill.current}% / {skill.target}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(skill.current / skill.target) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{skill.improvement}% este mês
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}