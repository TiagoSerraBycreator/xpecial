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

    // Buscar todas as conversas da empresa
    // Para isso, vamos buscar todas as mensagens onde a empresa é remetente ou destinatário
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { recipientId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        recipient: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Agrupar mensagens por candidato
    const conversationsMap = new Map()

    for (const message of messages) {
      const candidateUser = message.sender.role === 'CANDIDATE' ? message.sender : message.recipient
      const candidateId = candidateUser.id

      if (!conversationsMap.has(candidateId)) {
        // Buscar dados completos do candidato
        const candidate = await prisma.candidate.findUnique({
          where: { userId: candidateId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        if (candidate) {
          conversationsMap.set(candidateId, {
            candidateId: candidateId,
            candidateName: candidate.user.name,
            candidateEmail: candidate.user.email,
            lastMessage: message,
            unreadCount: 0,
            messages: []
          })
        }
      } else {
        // Atualizar última mensagem se for mais recente
        const conversation = conversationsMap.get(candidateId)
        if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message
        }
      }
    }

    // Converter Map para Array
    const conversations = Array.from(conversationsMap.values())

    return NextResponse.json(conversations)

  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}