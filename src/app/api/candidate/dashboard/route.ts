import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar candidato do usuário
    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    // Buscar estatísticas das candidaturas
    const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications] = await Promise.all([
      prisma.application.count({
        where: {
          candidateId: candidate.id
        }
      }),
      prisma.application.count({
        where: {
          candidateId: candidate.id,
          status: {
            in: ['APPLIED', 'SCREENING', 'INTERVIEW']
          }
        }
      }),
      prisma.application.count({
        where: {
          candidateId: candidate.id,
          status: 'HIRED'
        }
      }),
      prisma.application.count({
        where: {
          candidateId: candidate.id,
          status: 'REJECTED'
        }
      })
    ])

    // Buscar certificados do candidato
    const totalCertificates = await prisma.certificate.count({
      where: {
        candidateId: candidate.id
      }
    })

    // Buscar candidaturas recentes
    const recentApplications = await prisma.application.findMany({
      where: {
        candidateId: candidate.id
      },
      include: {
        job: {
          select: {
            title: true,
            city: true,
            state: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Buscar vagas disponíveis (que o candidato ainda não se candidatou)
    const appliedJobIds = await prisma.application.findMany({
      where: {
        candidateId: candidate.id
      },
      select: {
        jobId: true
      }
    })

    const appliedJobIdsArray = appliedJobIds.map(app => app.jobId)

    const availableJobs = await prisma.job.findMany({
      where: {
        status: 'APPROVED',
        id: {
          notIn: appliedJobIdsArray
        }
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Formatar datas
    const formattedRecentApplications = recentApplications.map(app => ({
      ...app,
      createdAt: app.createdAt.toISOString()
    }))

    const formattedAvailableJobs = availableJobs.map(job => ({
      ...job,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }))

    return NextResponse.json({
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      totalCertificates,
      recentApplications: formattedRecentApplications,
      availableJobs: formattedAvailableJobs
    })
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard do candidato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}