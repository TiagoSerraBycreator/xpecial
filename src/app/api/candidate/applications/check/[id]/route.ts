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

    // Verificar se já se candidatou
    const application = await prisma.application.findFirst({
      where: {
        candidateId: candidate.id,
        jobId: resolvedParams.id
      }
    })

    return NextResponse.json({ hasApplied: !!application })
  } catch (error) {
    console.error('Erro ao verificar candidatura:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}