import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar empresa do usuário
    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString())

    // Calcular datas do período atual e anterior
    const currentPeriodStart = new Date(year, month - 1, 1)
    const currentPeriodEnd = new Date(year, month, 0, 23, 59, 59)
    
    const previousPeriodStart = new Date(year, month - 2, 1)
    const previousPeriodEnd = new Date(year, month - 1, 0, 23, 59, 59)

    // Se for janeiro, o período anterior é dezembro do ano anterior
    if (month === 1) {
      previousPeriodStart.setFullYear(year - 1, 11, 1)
      previousPeriodEnd.setFullYear(year - 1, 11, 31)
      previousPeriodEnd.setHours(23, 59, 59, 999)
    }

    // Buscar dados do período atual
    const [currentJobs, currentApplications] = await Promise.all([
      prisma.job.findMany({
        where: {
          companyId: company.id,
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        },
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        }
      }),
      prisma.application.findMany({
        where: {
          job: {
            companyId: company.id
          },
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        }
      })
    ])

    // Buscar dados do período anterior
    const [previousJobs, previousApplications] = await Promise.all([
      prisma.job.findMany({
        where: {
          companyId: company.id,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        },
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        }
      }),
      prisma.application.findMany({
        where: {
          job: {
            companyId: company.id
          },
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      })
    ])

    // Calcular métricas do período atual
    const currentMetrics = {
      jobsPublished: currentJobs.length,
      totalApplications: currentApplications.length,
      approvedCandidates: currentApplications.filter(app => app.status === 'HIRED').length,
      participatingCandidates: currentApplications.filter(app => app.status === 'INTERVIEW').length,
      rejectedApplications: currentApplications.filter(app => app.status === 'REJECTED').length,
      pendingApplications: currentApplications.filter(app => app.status === 'APPLIED').length
    }

    // Calcular métricas do período anterior
    const previousMetrics = {
      jobsPublished: previousJobs.length,
      totalApplications: previousApplications.length,
      approvedCandidates: previousApplications.filter(app => app.status === 'HIRED').length,
      participatingCandidates: previousApplications.filter(app => app.status === 'INTERVIEW').length,
      rejectedApplications: previousApplications.filter(app => app.status === 'REJECTED').length,
      pendingApplications: previousApplications.filter(app => app.status === 'APPLIED').length
    }

    // Calcular variações percentuais
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const insights = {
      period: {
        current: {
          year,
          month,
          label: new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        },
        previous: {
          year: month === 1 ? year - 1 : year,
          month: month === 1 ? 12 : month - 1,
          label: new Date(month === 1 ? year - 1 : year, month === 1 ? 11 : month - 2).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        }
      },
      metrics: {
        current: currentMetrics,
        previous: previousMetrics,
        changes: {
          jobsPublished: calculatePercentageChange(currentMetrics.jobsPublished, previousMetrics.jobsPublished),
          totalApplications: calculatePercentageChange(currentMetrics.totalApplications, previousMetrics.totalApplications),
          approvedCandidates: calculatePercentageChange(currentMetrics.approvedCandidates, previousMetrics.approvedCandidates),
          participatingCandidates: calculatePercentageChange(currentMetrics.participatingCandidates, previousMetrics.participatingCandidates)
        }
      },
      chartData: {
        comparison: [
          {
            metric: 'Vagas Publicadas',
            current: currentMetrics.jobsPublished,
            previous: previousMetrics.jobsPublished
          },
          {
            metric: 'Total Candidaturas',
            current: currentMetrics.totalApplications,
            previous: previousMetrics.totalApplications
          },
          {
            metric: 'Candidatos Aprovados',
            current: currentMetrics.approvedCandidates,
            previous: previousMetrics.approvedCandidates
          },
          {
            metric: 'Candidatos Participantes',
            current: currentMetrics.participatingCandidates,
            previous: previousMetrics.participatingCandidates
          }
        ]
      }
    }

    return NextResponse.json(insights)

  } catch (error) {
    console.error('Erro ao buscar insights:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}