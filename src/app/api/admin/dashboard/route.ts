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

    // Get total counts
    const [totalUsers, totalCompanies, totalJobs, totalCertificates] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'COMPANY' } }),
      prisma.job.count(),
      prisma.certificate.count()
    ])

    // Get active jobs count
    const activeJobs = await prisma.job.count({
      where: { status: 'APPROVED' }
    })

    // Get pending applications count
    const pendingApplications = await prisma.application.count({
      where: { status: 'APPLIED' }
    })

    // Get recent users (last 5)
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Get recent jobs (last 5)
    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        company: {
          select: {
            name: true
          }
        }
      }
    })

    const dashboardStats = {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalCertificates,
      activeJobs,
      pendingApplications,
      recentUsers: recentUsers.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString()
      })),
      recentJobs: recentJobs.map(job => ({
        ...job,
        company: job.company?.name || 'Empresa não encontrada',
        createdAt: job.createdAt.toISOString()
      }))
    }

    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas do dashboard:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}