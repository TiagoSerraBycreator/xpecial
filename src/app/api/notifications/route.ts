import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema para validação
const createNotificationSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  type: z.enum(['APPLICATION_STATUS', 'NEW_APPLICATION', 'COURSE_COMPLETED', 'CERTIFICATE_ISSUED', 'JOB_APPROVED', 'COMPANY_APPROVED', 'NEW_MESSAGE']).default('APPLICATION_STATUS'),
  userId: z.string().optional(),
});

const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()),
});

// GET - Buscar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const skip = (page - 1) * limit;

    // Buscar notificações do usuário
    const where: any = {
      userId: session.user.id
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    // Formatar notificações
    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: mapNotificationTypeToDisplay(notification.type),
      read: notification.isRead,
      createdAt: notification.createdAt,
      time: getRelativeTime(notification.createdAt)
    }));

    // Função para mapear tipos de notificação
    function mapNotificationTypeToDisplay(type: string): 'info' | 'success' | 'warning' | 'error' {
      switch (type) {
        case 'CERTIFICATE_ISSUED':
        case 'COURSE_COMPLETED':
        case 'JOB_APPROVED':
        case 'COMPANY_APPROVED':
          return 'success';
        case 'APPLICATION_STATUS':
          return 'info';
        case 'NEW_APPLICATION':
          return 'info';
        case 'NEW_MESSAGE':
          return 'info';
        default:
          return 'info';
      }
    }

    return NextResponse.json({
      notifications: formattedNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount: await prisma.notification.count({
        where: {
          userId: session.user.id,
          isRead: false
        }
      })
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova notificação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createNotificationSchema.parse(body);

    const notification = await prisma.notification.create({
      data: {
        title: validatedData.title,
        message: validatedData.message,
        type: validatedData.type,
        userId: validatedData.userId || session.user.id,
        isRead: false
      }
    });

    return NextResponse.json({
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.isRead,
        createdAt: notification.createdAt,
        time: getRelativeTime(notification.createdAt)
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Marcar notificações como lidas
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = markAsReadSchema.parse(body);

    // Marcar notificações como lidas
    await prisma.notification.updateMany({
      where: {
        id: {
          in: validatedData.notificationIds
        },
        userId: session.user.id
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Erro ao marcar notificações como lidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular tempo relativo
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hora${diffInHours > 1 ? 's' : ''} atrás`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''} atrás`;
  }

  return date.toLocaleDateString('pt-BR');
}