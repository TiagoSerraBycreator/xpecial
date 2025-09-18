import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params;

    // Buscar o candidato
    const candidate = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!candidate || candidate.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar a vaga específica
    const job = await prisma.job.findUnique({
      where: {
        id: resolvedParams.id,
        status: 'APPROVED'
      },
      include: {
        company: {
          select: {
            name: true,
            description: true
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
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 })
    }

    // Formatar a resposta
    const formattedJob = {
      ...job,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString()
    }

    return NextResponse.json(formattedJob)
  } catch (error) {
    console.error('Erro ao buscar vaga:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}