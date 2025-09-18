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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'ALL'
    const jobId = searchParams.get('jobId') || 'ALL'

    const skip = (page - 1) * limit

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

    // Construir filtros
    const where: any = {
      job: {
        companyId: company.id
      }
    }

    if (search) {
      where.OR = [
        {
          candidate: {
            user: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          candidate: {
            user: {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          candidate: {
            skills: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          message: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (status !== 'ALL') {
      where.status = status
    }

    if (jobId !== 'ALL') {
      where.jobId = jobId
    }

    // Buscar candidaturas
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          candidate: {
            include: {
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
              id: true,
              title: true,
              location: true,
              city: true,
              state: true,
              salaryMin: true,
              salaryMax: true,
              workMode: true
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

    const totalPages = Math.ceil(total / limit)

    // Formatar datas
    const formattedApplications = applications.map(app => ({
      ...app,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString()
    }))

    return NextResponse.json({
      applications: formattedApplications,
      total,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Erro ao buscar candidaturas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}