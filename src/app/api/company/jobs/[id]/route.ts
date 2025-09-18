import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
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

    const { id } = await params

    // Buscar vaga
    const job = await prisma.job.findFirst({
      where: {
        id: id,
        companyId: company.id
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                phone: true,
                city: true,
                state: true,
                skills: true,
                experience: true,
                education: true,
                dateOfBirth: true,
                description: true,
                aboutMe: true,
                profileVideoUrl: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // Formatar localização
    let location = 'Remoto'
    if (job.city && job.state) {
      location = `${job.city}, ${job.state}`
    } else if (job.city) {
      location = job.city
    } else if (job.state) {
      location = job.state
    }

    // Formatar datas
    const formattedJob = {
      ...job,
      location,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      applications: job.applications.map(app => ({
        ...app,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString()
      }))
    }

    return NextResponse.json(formattedJob)
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      requirements,
      responsibilities,
      benefits,
      location,
      city,
      state,
      salary,
      type,
      level,
      workMode,
      status,
      salaryMin,
      salaryMax,
      skills,
      experienceYears,
      education,
      languages
    } = body

    console.log('=== DEBUG PUT REQUEST ===')
    console.log('Job ID:', id)
    console.log('Request body:', JSON.stringify(body, null, 2))

    // Validação básica
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título e descrição são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de localização mais flexível
    const isRemote = location && (location.toLowerCase().includes('remoto') || location.toLowerCase() === 'remoto')
    
    if (!location) {
      return NextResponse.json(
        { error: 'Localização é obrigatória' },
        { status: 400 }
      )
    }
    
    // Para trabalho presencial, verificar se temos city e state
    if (!isRemote && (!city || !state)) {
      return NextResponse.json(
        { error: 'Para trabalho presencial, cidade e estado são obrigatórios' },
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

    // Verificar se a vaga pertence à empresa
    const existingJob = await prisma.job.findFirst({
      where: {
        id: id,
        companyId: company.id
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // Mapear workMode do formulário para o banco de dados
    let dbWorkMode: 'PRESENCIAL' | 'REMOTO' | 'HIBRIDO' = 'PRESENCIAL'
    if (workMode === 'REMOTE') {
      dbWorkMode = 'REMOTO'
    } else if (workMode === 'HYBRID') {
      dbWorkMode = 'HIBRIDO'
    } else if (workMode === 'ONSITE') {
      dbWorkMode = 'PRESENCIAL'
    }

    // Mapear status para o enum correto
    let jobStatus = status
    if (status === 'ACTIVE') jobStatus = 'APPROVED'
    if (status === 'DRAFT') jobStatus = 'PENDING'

    // Atualizar vaga
    const updatedJob = await prisma.job.update({
      where: {
        id: id
      },
      data: {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements?.trim() || null,
        responsibilities: responsibilities?.trim() || null,
        benefits: benefits?.trim() || null,
        location: location?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        type: type || 'FULL_TIME',
        level: level || 'PLENO',
        workMode: dbWorkMode,
        status: jobStatus,
        salaryMin: salaryMin ? parseFloat(salaryMin.toString()) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax.toString()) : null,
        skills: Array.isArray(skills) ? skills.join(', ') : (skills || null),
        experienceYears: experienceYears ? parseInt(experienceYears.toString()) : null,
        education: education?.trim() || null,
        languages: Array.isArray(languages) ? languages.join(', ') : (languages || null)
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

    console.log('=== JOB UPDATED SUCCESSFULLY ===')
    console.log('Updated job:', JSON.stringify(updatedJob, null, 2))

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status é obrigatório' },
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

    // Verificar se a vaga pertence à empresa
    const existingJob = await prisma.job.findFirst({
      where: {
        id: id,
        companyId: company.id
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar apenas o status
    const updatedJob = await prisma.job.update({
      where: {
        id: id
      },
      data: {
        status
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

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Erro ao atualizar status da vaga:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

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

    // Verificar se a vaga pertence à empresa
    const existingJob = await prisma.job.findFirst({
      where: {
        id: id,
        companyId: company.id
      }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // Excluir vaga e candidaturas relacionadas em transação
    await prisma.$transaction(async (tx) => {
      // Excluir candidaturas
      await tx.application.deleteMany({
        where: {
          jobId: id
        }
      })

      // Excluir vaga
      await tx.job.delete({
        where: {
          id: id
        }
      })
    })

    return NextResponse.json(
      { message: 'Vaga excluída com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao excluir vaga:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}