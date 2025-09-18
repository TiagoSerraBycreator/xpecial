import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

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

    // Buscar IDs das vagas que o candidato já se candidatou
    const appliedJobs = await prisma.application.findMany({
      where: {
        candidateId: candidate.id
      },
      select: {
        jobId: true
      }
    })

    const appliedJobIds = appliedJobs.map(app => app.jobId)

    // Buscar vagas recomendadas (excluindo as que já se candidatou)
    const jobs = await prisma.job.findMany({
      where: {
        status: 'APPROVED',
        id: {
          notIn: appliedJobIds
        }
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Formatar dados para o frontend
    const formattedJobs = jobs.map(job => {
      let location = 'Remoto'
      if (job.city && job.state) {
        location = `${job.city}, ${job.state}`
      } else if (job.city) {
        location = job.city
      } else if (job.state) {
        location = job.state
      }

      return {
        id: job.id,
        title: job.title,
        company: {
          name: job.company.name,
          logo: job.company.logo
        },
        location,
        city: job.city,
        state: job.state,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        workMode: job.workMode,
        createdAt: job.createdAt.toISOString(),
        matchScore: Math.floor(Math.random() * 30) + 70 // Score simulado entre 70-100
      }
    })

    return NextResponse.json({
      jobs: formattedJobs,
      total: formattedJobs.length
    })
  } catch (error) {
    console.error('Erro ao buscar vagas recomendadas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}