import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'COMPANY') {
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

    // Verificar se o destinatário existe e é um candidato
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      include: {
        candidate: true
      }
    })

    if (!recipient || recipient.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Destinatário não encontrado ou inválido' },
        { status: 404 }
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

    // Criar notificação para o candidato
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
    
    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')

    if (!candidateId) {
      return NextResponse.json(
        { error: 'ID do candidato é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar mensagens entre a empresa e o candidato
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: session.user.id,
            recipientId: candidateId
          },
          {
            senderId: candidateId,
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