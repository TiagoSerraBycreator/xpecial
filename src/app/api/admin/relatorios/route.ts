import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Define date range (default to last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Get user statistics
    const [totalUsers, newUsersInPeriod, usersByRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      })
    ])

    // Get job statistics
    const [totalJobs, newJobsInPeriod, jobsByStatus, jobsBySector] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.job.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      }),
      prisma.job.groupBy({
        by: ['sector'],
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ])

    // Get application statistics
    const [totalApplications, newApplicationsInPeriod, applicationsByStatus] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      }),
      prisma.application.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      })
    ])

    // Get monthly growth data for the last 12 months
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      monthEnd.setHours(23, 59, 59, 999)

      const [users, jobs, applications] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.job.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        }),
        prisma.application.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd
            }
          }
        })
      ])

      monthlyData.push({
        month: monthStart.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        users,
        jobs,
        applications
      })
    }

    // Get top performing companies
    const topCompanies = await prisma.user.findMany({
      where: {
        role: 'COMPANY'
      },
      select: {
        id: true,
        name: true,
        company: {
          select: {
            id: true,
            name: true,
            jobs: {
              select: {
                id: true,
                _count: {
                  select: {
                    applications: true
                  }
                }
              }
            }
          }
        }
      },
      take: 10
    })

    const companiesWithStats = topCompanies
      .filter(user => user.company) // Filter out users without company
      .map(user => ({
        id: user.company!.id,
        name: user.company!.name,
        totalJobs: user.company!.jobs.length,
        totalApplications: user.company!.jobs.reduce((sum, job) => sum + job._count.applications, 0)
      })).sort((a, b) => b.totalApplications - a.totalApplications)

    // Get location statistics
    const locationStats = await prisma.job.groupBy({
      by: ['city', 'state'],
      _count: {
        id: true
      },
      where: {
        city: {
          not: null
        },
        state: {
          not: null
        }
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    })

    const reportData = {
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        newUsersInPeriod,
        newJobsInPeriod,
        newApplicationsInPeriod
      },
      userStats: {
        total: totalUsers,
        byRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.id
        })),
        newInPeriod: newUsersInPeriod
      },
      jobStats: {
        total: totalJobs,
        byStatus: jobsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        bySector: jobsBySector.map(item => ({
          sector: item.sector,
          count: item._count.id
        })),
        newInPeriod: newJobsInPeriod
      },
      applicationStats: {
        total: totalApplications,
        byStatus: applicationsByStatus.map(item => ({
          status: item.status,
          count: item._count.id
        })),
        newInPeriod: newApplicationsInPeriod
      },
      monthlyGrowth: monthlyData,
      topCompanies: companiesWithStats,
      locationStats: locationStats.map(item => ({
        location: `${item.city}, ${item.state}`,
        count: item._count.id
      }))
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}