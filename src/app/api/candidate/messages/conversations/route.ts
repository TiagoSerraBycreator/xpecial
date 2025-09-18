import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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

    // Buscar todas as conversas do candidato
    // Para isso, vamos buscar todas as mensagens onde o candidato é remetente ou destinatário
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

    // Agrupar mensagens por empresa
    const conversationsMap = new Map()

    for (const message of messages) {
      const companyUser = message.sender.role === 'COMPANY' ? message.sender : message.recipient
      const companyId = companyUser.id

      if (!conversationsMap.has(companyId)) {
        // Buscar dados completos da empresa
        const company = await prisma.company.findUnique({
          where: { userId: companyId },
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

        if (company) {
          conversationsMap.set(companyId, {
            companyId: companyId,
            companyName: company.name,
            companyEmail: company.user.email,
            lastMessage: message,
            unreadCount: 0,
            messages: []
          })
        }
      } else {
        // Atualizar última mensagem se for mais recente
        const conversation = conversationsMap.get(companyId)
        if (new Date(message.createdAt) > new Date(conversation.lastMessage.createdAt)) {
          conversation.lastMessage = message
        }
      }
    }

    // Calcular mensagens não lidas para cada conversa
    for (const [companyId, conversation] of conversationsMap) {
      const unreadCount = await prisma.message.count({
        where: {
          senderId: companyId,
          recipientId: session.user.id,
          isRead: false
        }
      })
      conversation.unreadCount = unreadCount
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