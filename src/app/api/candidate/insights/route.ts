import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário é um candidato
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        candidate: true
      }
    })

    if (!user || user.role !== 'CANDIDATE' || !user.candidate) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas candidatos podem acessar estes dados.' },
        { status: 403 }
      )
    }

    const candidateId = user.candidate.id
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1

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
    const [currentApplications, currentCertificates] = await Promise.all([
      prisma.application.findMany({
        where: {
          candidateId: candidateId,
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        },
        include: {
          job: {
            select: {
              title: true,
              company: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.certificate.findMany({
        where: {
          candidateId: candidateId,
          issuedAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        }
      })
    ])

    // Buscar dados do período anterior
    const [previousApplications, previousCertificates] = await Promise.all([
      prisma.application.findMany({
        where: {
          candidateId: candidateId,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      }),
      prisma.certificate.findMany({
        where: {
          candidateId: candidateId,
          issuedAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      })
    ])

    // Calcular métricas do período atual
    const currentMetrics = {
      totalApplications: currentApplications.length,
      pendingApplications: currentApplications.filter(app => ['APPLIED', 'SCREENING', 'INTERVIEW'].includes(app.status)).length,
      acceptedApplications: currentApplications.filter(app => app.status === 'HIRED').length,
      rejectedApplications: currentApplications.filter(app => app.status === 'REJECTED').length,
      certificatesEarned: currentCertificates.length
    }

    // Calcular métricas do período anterior
    const previousMetrics = {
      totalApplications: previousApplications.length,
      pendingApplications: previousApplications.filter(app => ['APPLIED', 'SCREENING', 'INTERVIEW'].includes(app.status)).length,
      acceptedApplications: previousApplications.filter(app => app.status === 'HIRED').length,
      rejectedApplications: previousApplications.filter(app => app.status === 'REJECTED').length,
      certificatesEarned: previousCertificates.length
    }

    // Calcular mudanças percentuais
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const changes = {
      totalApplications: calculateChange(currentMetrics.totalApplications, previousMetrics.totalApplications),
      pendingApplications: calculateChange(currentMetrics.pendingApplications, previousMetrics.pendingApplications),
      acceptedApplications: calculateChange(currentMetrics.acceptedApplications, previousMetrics.acceptedApplications),
      rejectedApplications: calculateChange(currentMetrics.rejectedApplications, previousMetrics.rejectedApplications),
      certificatesEarned: calculateChange(currentMetrics.certificatesEarned, previousMetrics.certificatesEarned)
    }

    // Buscar dados para gráficos (últimos 6 meses)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyApplications = await prisma.application.findMany({
      where: {
        candidateId: candidateId,
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    })

    // Agrupar por mês
    const monthlyData = monthlyApplications.reduce((acc, app) => {
      const monthKey = app.createdAt.toISOString().substring(0, 7) // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          accepted: 0,
          rejected: 0,
          pending: 0
        }
      }
      acc[monthKey].total++
      if (app.status === 'HIRED') acc[monthKey].accepted++
      if (app.status === 'REJECTED') acc[monthKey].rejected++
      if (['APPLIED', 'SCREENING', 'INTERVIEW'].includes(app.status)) acc[monthKey].pending++
      return acc
    }, {} as Record<string, any>)

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
        changes
      },
      chartData: {
        comparison: [
          {
            metric: 'Total de Candidaturas',
            current: currentMetrics.totalApplications,
            previous: previousMetrics.totalApplications
          },
          {
            metric: 'Candidaturas Aceitas',
            current: currentMetrics.acceptedApplications,
            previous: previousMetrics.acceptedApplications
          },
          {
            metric: 'Candidaturas Rejeitadas',
            current: currentMetrics.rejectedApplications,
            previous: previousMetrics.rejectedApplications
          },
          {
            metric: 'Certificados Obtidos',
            current: currentMetrics.certificatesEarned,
            previous: previousMetrics.certificatesEarned
          }
        ],
        monthly: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ...data
        }))
      },
      recentApplications: currentApplications.slice(0, 5).map(app => ({
        id: app.id,
        jobTitle: app.job.title,
        companyName: app.job.company.name,
        status: app.status,
        appliedAt: app.createdAt
      }))
    }

    return NextResponse.json(insights)

  } catch (error) {
    console.error('Erro ao buscar insights do candidato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}