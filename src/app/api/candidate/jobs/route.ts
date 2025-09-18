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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const location = searchParams.get('location') || ''
    const workMode = searchParams.get('workMode') || ''

    const skip = (page - 1) * limit

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

    // Construir filtros
    const where: any = {
      status: 'APPROVED', // Mudança: usar APPROVED ao invés de ACTIVE
      id: {
        notIn: appliedJobIds // Excluir vagas que o candidato já se candidatou
      }
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (location) {
      where.OR = [
        {
          city: {
            contains: location,
            mode: 'insensitive'
          }
        },
        {
          state: {
            contains: location,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (workMode) {
      where.workMode = workMode
    }

    // Buscar vagas com contagem total
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true
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
        skip,
        take: limit
      }),
      prisma.job.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Formatar datas
    const formattedJobs = jobs.map(job => ({
      ...job,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }))

    return NextResponse.json({
      jobs: formattedJobs,
      totalCount,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Erro ao buscar vagas para candidato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}