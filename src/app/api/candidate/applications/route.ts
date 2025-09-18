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
    const status = searchParams.get('status') || ''

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

    // Construir filtros
    const where: any = {
      candidateId: candidate.id
    }

    if (search) {
      where.job = {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            company: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        ]
      }
    }

    if (status) {
      where.status = status
    }

    // Buscar candidaturas com contagem total
    const [applications, totalCount] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              city: true,
              state: true,
              salaryMin: true,
              salaryMax: true,
              workMode: true,
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
        skip,
        take: limit
      }),
      prisma.application.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Formatar datas
    const formattedApplications = applications.map(application => ({
      ...application,
      createdAt: application.createdAt.toISOString()
    }))

    return NextResponse.json({
      applications: formattedApplications,
      totalCount,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Erro ao buscar candidaturas do candidato:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { jobId, whatsapp, consent } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'ID da vaga é obrigatório' },
        { status: 400 }
      )
    }

    if (!whatsapp) {
      return NextResponse.json(
        { error: 'WhatsApp é obrigatório' },
        { status: 400 }
      )
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'Consentimento para liberação de dados é obrigatório' },
        { status: 400 }
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

    // Verificar se a vaga existe e está ativa
    const job = await prisma.job.findUnique({
      where: {
        id: jobId
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    if (job.status !== 'APPROVED' || !job.isActive) {
      return NextResponse.json(
        { error: 'Esta vaga não está mais disponível' },
        { status: 400 }
      )
    }

    // Verificar se o candidato já se candidatou a esta vaga
    const existingApplication = await prisma.application.findFirst({
      where: {
        candidateId: candidate.id,
        jobId: jobId
      }
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Você já se candidatou a esta vaga' },
        { status: 400 }
      )
    }

    // Criar candidatura
    const application = await prisma.application.create({
      data: {
        candidateId: candidate.id,
        jobId: jobId,
        status: 'APPLIED',
        whatsapp: whatsapp,
        consent: consent
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
    })

    return NextResponse.json({
      ...application,
      createdAt: application.createdAt.toISOString()
    })
  } catch (error) {
    console.error('Erro ao criar candidatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}