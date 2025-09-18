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
    const type = searchParams.get('type') || 'ALL'

    const skip = (page - 1) * limit

    // Buscar a empresa do usuário logado
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      )
    }

    // Construir filtros
    const where: any = {
      companyId: company.id
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
        },
        {
          location: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (status !== 'ALL') {
      where.status = status
    }

    if (type !== 'ALL') {
      where.type = type
    }

    // Buscar vagas com contagem de candidaturas
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
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

    const totalPages = Math.ceil(total / limit)

    // Formatar localização para cada vaga
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
        ...job,
        location
      }
    })

    return NextResponse.json({
      jobs: formattedJobs,
      total,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Erro ao buscar vagas da empresa:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      requirements,
      location,
      city,
      state,
      salaryMin,
      salaryMax,
      workMode = 'PRESENCIAL',
      status = 'PENDING',
      recruitmentVideoUrl
    } = body

    // Converter salários para números
    const salaryMinNum = salaryMin ? parseFloat(salaryMin) : null
    const salaryMaxNum = salaryMax ? parseFloat(salaryMax) : null

    // Mapear workMode para valores válidos do enum
    const workModeMap: { [key: string]: 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO' } = {
      'PRESENCIAL': 'PRESENCIAL',
      'REMOTO': 'REMOTO', 
      'REMOTE': 'REMOTO',
      'HYBRID': 'HIBRIDO',
      'HIBRIDO': 'HIBRIDO'
    }
    const validWorkMode: 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO' = workModeMap[workMode?.toUpperCase()] || 'PRESENCIAL'

    // Validação básica
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser preenchidos' },
        { status: 400 }
      )
    }

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

    // Criar vaga
    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements?.trim() || null,
        city,
        state,
        salaryMin: salaryMinNum,
        salaryMax: salaryMaxNum,
        workMode: validWorkMode,
        status: status === 'ACTIVE' ? 'APPROVED' : 'PENDING',
        recruitmentVideoUrl: recruitmentVideoUrl?.trim() || null,
        companyId: company.id
      },
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
      }
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar vaga:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}