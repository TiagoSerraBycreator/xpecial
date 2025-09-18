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

    // Buscar candidatura
    const application = await prisma.application.findFirst({
      where: {
        id: id,
        job: {
          companyId: company.id
        }
      },
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
            description: true,
            requirements: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            status: true
          }
        }
      }
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Candidatura não encontrada' },
        { status: 404 }
      )
    }

    // Formatar datas
    const formattedApplication = {
      ...application,
      createdAt: application.createdAt.toISOString(),
      updatedAt: application.updatedAt.toISOString()
    }

    return NextResponse.json(formattedApplication)
  } catch (error) {
    console.error('Erro ao buscar candidatura:', error)
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

    // Validar status
    const validStatuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'HIRED', 'REJECTED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
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

    // Verificar se a candidatura pertence à empresa
    const existingApplication = await prisma.application.findFirst({
      where: {
        id: id,
        job: {
          companyId: company.id
        }
      }
    })

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Candidatura não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar status da candidatura
    const updatedApplication = await prisma.application.update({
      where: {
        id: id
      },
      data: {
        status
      },
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
            location: true
          }
        }
      }
    })

    // Formatar datas
    const formattedApplication = {
      ...updatedApplication,
      createdAt: updatedApplication.createdAt.toISOString(),
      updatedAt: updatedApplication.updatedAt.toISOString()
    }

    return NextResponse.json(formattedApplication)
  } catch (error) {
    console.error('Erro ao atualizar candidatura:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}