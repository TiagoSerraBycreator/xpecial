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
    const [totalJobs, activeJobs, totalApplications, approvedCandidates, participatingCandidates] = await Promise.all([
      prisma.job.count({
        where: { companyId: company.id }
      }),
      prisma.job.count({
        where: { 
          companyId: company.id,
          status: 'APPROVED'
        }
      }),
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          }
        }
      }),
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          },
          status: 'HIRED'
        }
      }),
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          },
          status: 'APPLIED'
        }
      })
    ])

    // Get recent jobs (last 5)
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

    // Get recent applications (last 5)
    const recentApplications = await prisma.application.findMany({
      where: {
        job: {
          companyId: company.id
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        candidate: {
          select: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        job: {
          select: {
            title: true
          }
        }
      }
    })

    // Get recent activities (applications and status changes)
    const recentActivities = await prisma.application.findMany({
      where: {
        job: {
          companyId: company.id
        }
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        candidate: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        job: {
          select: {
            title: true
          }
        }
      }
    })

    // Get top performing jobs (by application count)
    const topPerformingJobs = await prisma.job.findMany({
      where: { companyId: company.id },
      take: 5,
      orderBy: {
        applications: {
          _count: 'desc'
        }
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    // Calculate monthly growth (mock data for now - would need historical data)
    const monthlyGrowth = {
      jobs: Math.floor(Math.random() * 30) + 5, // 5-35%
      applications: Math.floor(Math.random() * 40) + 10, // 10-50%
      candidates: Math.floor(Math.random() * 25) + 5 // 5-30%
    }

    const dashboardStats = {
      totalJobs,
      activeJobs,
      totalApplications,
      approvedCandidates,
      participatingCandidates,
      monthlyGrowth,
      recentJobs: recentJobs.map(job => ({
        ...job,
        createdAt: job.createdAt.toISOString()
      })),
      recentApplications: recentApplications.map(app => ({
        ...app,
        createdAt: app.createdAt.toISOString()
      })),
      topPerformingJobs: topPerformingJobs.map(job => ({
        id: job.id,
        title: job.title,
        applications: job._count.applications,
        views: Math.floor(Math.random() * 100) + 50 // Mock views data
      })),
      recentActivities: recentActivities.map(activity => ({
        ...activity,
        createdAt: activity.createdAt.toISOString(),
        updatedAt: activity.updatedAt.toISOString()
      }))
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard da empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}