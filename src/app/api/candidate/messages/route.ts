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

    const { recipientId, content } = await request.json()

    if (!recipientId || !content) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      )
    }

    // Verificar se o destinatário existe e é uma empresa
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      include: {
        company: true
      }
    })

    if (!recipient || recipient.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Destinatário não encontrado ou inválido' },
        { status: 404 }
      )
    }

    // Verificar se já existe uma conversa entre eles (candidato só pode responder)
    const existingConversation = await prisma.message.findFirst({
      where: {
        OR: [
          {
            senderId: recipientId,
            recipientId: session.user.id
          },
          {
            senderId: session.user.id,
            recipientId: recipientId
          }
        ]
      }
    })

    if (!existingConversation) {
      return NextResponse.json(
        { error: 'Você só pode responder a mensagens de empresas' },
        { status: 400 }
      )
    }

    // Criar a mensagem
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: session.user.id,
        recipientId: recipientId
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
      }
    })

    // Criar notificação para a empresa
    try {
      await prisma.notification.create({
        data: {
          title: 'Nova mensagem',
          message: `Você recebeu uma nova mensagem de ${message.sender.name}`,
          type: 'NEW_MESSAGE',
          userId: recipientId,
          isRead: false
        }
      })
    } catch (notificationError) {
      console.error('Erro ao criar notificação:', notificationError)
      // Não falhar o envio da mensagem se a notificação falhar
    }

    return NextResponse.json(message)

  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'ID da empresa é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar mensagens entre o candidato e a empresa
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            recipientId: companyId
          },
          {
            senderId: companyId,
            recipientId: session.user.id
          }
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
        createdAt: 'asc'
      }
    })

    return NextResponse.json(messages)

  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}