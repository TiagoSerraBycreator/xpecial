import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Validate Slug API iniciada ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', !!session, session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('Erro: Não autorizado');
      return NextResponse.json(
        { available: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }

    console.log('Lendo body da requisição...');
    const body = await request.json();
    console.log('Body recebido:', body);
    const { slug } = body;

    if (!slug || typeof slug !== 'string') {
      console.log('Erro: Slug inválido:', slug);
      return NextResponse.json(
        { available: false, error: 'Slug inválido' },
        { status: 400 }
      );
    }

    // Normalizar o slug
    const normalizedSlug = slug.toLowerCase().trim();
    console.log('Slug normalizado:', normalizedSlug);
    
    if (normalizedSlug.length < 3) {
      console.log('Erro: Slug muito curto');
      return NextResponse.json({
        available: false,
        error: 'Slug deve ter pelo menos 3 caracteres'
      });
    }

    console.log('Buscando usuário...');
    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    console.log('Usuário encontrado:', !!user, user?.id);

    if (!user) {
      console.log('Erro: Usuário não encontrado');
      return NextResponse.json(
        { available: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log('Verificando slug existente...');
    // Verificar se slug já existe para outras empresas
    const existingCompany = await prisma.company.findFirst({
      where: {
        slug: normalizedSlug,
        userId: { not: user.id }
      },
      select: { id: true }
    });
    console.log('Empresa existente:', !!existingCompany);

    const result = {
      available: !existingCompany,
      slug: normalizedSlug
    };
    console.log('Resultado final:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('ERRO DETALHADO na validação de slug:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'Sem stack');
    return NextResponse.json(
      { available: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}