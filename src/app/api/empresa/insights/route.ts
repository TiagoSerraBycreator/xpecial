import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = parseInt(searchParams.get('period') || '30');
    
    // Calcular data de início baseada no período
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Para simplificar, vamos buscar todas as empresas por enquanto
    // TODO: Implementar lógica de empresa específica quando necessário

    // Total de vagas
    const totalJobs = await prisma.job.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    // Vagas ativas
    const activeJobs = await prisma.job.count({
      where: {
        status: 'APPROVED',
        isActive: true,
        createdAt: {
          gte: startDate
        }
      }
    });

    // Total de candidaturas
    const totalApplications = await prisma.application.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    // Simular visualizações (já que não temos essa tabela ainda)
    const totalViews = totalApplications * 5; // Estimativa: 5 visualizações por candidatura

    // Média de candidaturas por vaga
    const averageApplicationsPerJob = totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0;

    // Vagas com melhor performance
    const topPerformingJobs = await prisma.job.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        applications: {
          _count: 'desc'
        }
      },
      take: 5
    });

    const formattedTopJobs = topPerformingJobs.map(job => ({
      id: job.id,
      title: job.title,
      applications: job._count.applications,
      views: job._count.applications * 5 // Estimativa
    }));

    // Tendência de candidaturas (últimos 7 dias)
    const applicationTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dayApplications = await prisma.application.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      applicationTrends.push({
        date: startOfDay.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        applications: dayApplications,
        views: dayApplications * 5
      });
    }

    // Estatísticas por localização (baseado na localização das vagas)
    const locationStats = await prisma.job.groupBy({
      by: ['city'],
      where: {
        createdAt: {
          gte: startDate
        },
        city: {
          not: null
        }
      },
      _count: {
        city: true
      },
      orderBy: {
        _count: {
          city: 'desc'
        }
      },
      take: 10
    });

    const formattedLocationStats = locationStats.map(stat => ({
      location: stat.city || 'Não informado',
      count: stat._count.city
    }));

    // Estatísticas por setor
    const categoryStats = await prisma.job.groupBy({
      by: ['sector'],
      where: {
        createdAt: {
          gte: startDate
        },
        sector: {
          not: null
        }
      },
      _count: {
        sector: true
      },
      orderBy: {
        _count: {
          sector: 'desc'
        }
      }
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    const formattedCategoryStats = categoryStats.map((stat, index) => ({
      category: stat.sector || 'Não informado',
      count: stat._count.sector,
      color: colors[index % colors.length]
    }));

    const insights = {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      averageApplicationsPerJob,
      topPerformingJobs: formattedTopJobs,
      applicationTrends,
      locationStats: formattedLocationStats,
      categoryStats: formattedCategoryStats
    };

    return NextResponse.json(insights);
    
  } catch (error) {
    console.error('Erro ao buscar insights:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}