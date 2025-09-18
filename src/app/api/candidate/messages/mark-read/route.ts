import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { companyId } = await request.json()

    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    // Marcar todas as mensagens da empresa para este candidato como lidas
    const updatedMessages = await prisma.message.updateMany({
      where: {
        senderId: companyId,
        recipientId: session.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      message: 'Mensagens marcadas como lidas',
      count: updatedMessages.count
    })

  } catch (error) {
    console.error('Erro ao marcar mensagens como lidas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}