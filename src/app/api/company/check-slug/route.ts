import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar o usuário atual
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o slug já existe (excluindo a empresa atual do usuário)
    const existingCompany = await prisma.company.findFirst({
      where: {
        slug: slug,
        NOT: {
          userId: currentUser.id
        }
      }
    });

    return NextResponse.json({
      available: !existingCompany,
      slug: slug
    });

  } catch (error) {
    console.error('Erro ao verificar slug:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}