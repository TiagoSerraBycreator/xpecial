import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateJobSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'CLOSED'])
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    const job = await prisma.job.findUnique({
      where: { id: id },
      include: {
        company: {
          include: {
            user: {
              select: {
                email: true,
                name: true
              }
            }
          }
        },
        applications: {
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

    const formattedJob = {
      ...job,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateJobSchema.parse(body)

    // Check if job exists
    const existingJob = await prisma.job.findUnique({
      where: { id: id }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      )
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: id },
      data: {
        status: validatedData.status
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Status da vaga atualizado com sucesso',
      job: {
        ...updatedJob,
        createdAt: updatedJob.createdAt.toISOString(),
        updatedAt: updatedJob.updatedAt.toISOString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar vaga:', error)
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

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: id },
      include: {
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

    // Delete job and related applications in transaction
    await prisma.$transaction(async (tx) => {
      // Delete applications first
      await tx.application.deleteMany({
        where: { jobId: id }
      })

      // Then delete the job
      await tx.job.delete({
        where: { id: id }
      })
    })

    return NextResponse.json({
      message: `Vaga excluída com sucesso. ${job._count.applications} candidaturas também foram removidas.`
    })
  } catch (error) {
    console.error('Erro ao excluir vaga:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}