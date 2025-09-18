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

    // Get company profile
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Perfil da empresa não encontrado' },
        { status: 404 }
      )
    }

    // Get statistics
    const [totalJobs, activeJobs, pendingJobs, closedJobs, totalApplications, appliedApplications, hiredApplications, rejectedApplications] = await Promise.all([
      // Total de vagas
      prisma.job.count({
        where: { companyId: company.id }
      }),
      // Vagas ativas
      prisma.job.count({
        where: { 
          companyId: company.id,
          status: 'APPROVED'
        }
      }),
      // Vagas pendentes
      prisma.job.count({
        where: {
          companyId: company.id,
          status: 'PENDING'
        }
      }),
      // Vagas fechadas
      prisma.job.count({
        where: { 
          companyId: company.id,
          status: 'CLOSED'
        }
      }),
      // Total de candidaturas
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          }
        }
      }),
      // Candidaturas pendentes
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          },
          status: 'APPLIED'
        }
      }),
      // Candidaturas aprovadas
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          },
          status: 'HIRED'
        }
      }),
      // Candidaturas rejeitadas
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          },
          status: 'REJECTED'
        }
      })
    ])

    // Get recent jobs (últimas 5 vagas criadas)
    const recentJobs = await prisma.job.findMany({
      where: { companyId: company.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    // Get jobs by status for chart data
    const jobsByStatus = [
      { status: 'Contratando', count: activeJobs, color: '#10b981' },
      { status: 'Pendentes', count: pendingJobs, color: '#f59e0b' },
      { status: 'Fechadas', count: closedJobs, color: '#ef4444' }
    ]

    // Get applications by status for chart data
    const applicationsByStatus = [
      { status: 'Candidatadas', count: appliedApplications, color: '#f59e0b' },
      { status: 'Contratadas', count: hiredApplications, color: '#10b981' },
      { status: 'Rejeitadas', count: rejectedApplications, color: '#ef4444' }
    ]

    const stats = {
      // Estatísticas principais
      totalJobs,
      activeJobs,
      pendingJobs,
      closedJobs,
      totalApplications,
      appliedApplications,
      hiredApplications,
      rejectedApplications,
      
      // Vagas recentes
      recentJobs: recentJobs.map(job => ({
        ...job,
        createdAt: job.createdAt.toISOString()
      })),
      
      // Dados para gráficos
      jobsByStatus,
      applicationsByStatus,
      
      // Métricas calculadas
      averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0,
      jobsActivePercentage: totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas da empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}