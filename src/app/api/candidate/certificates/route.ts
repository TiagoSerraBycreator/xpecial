import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
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

    // Buscar certificados do candidato
    const certificates = await prisma.certificate.findMany({
      where: {
        candidateId: candidate.id
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        issuedAt: 'desc'
      }
    })

    // Formatar datas
    const formattedCertificates = certificates.map(certificate => ({
      ...certificate,
      issuedAt: certificate.issuedAt.toISOString()
    }))

    return NextResponse.json({
      certificates: formattedCertificates
    })
  } catch (error) {
    console.error('Erro ao buscar certificados:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}