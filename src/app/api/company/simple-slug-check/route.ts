import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Simple Slug Check API ===');
    
    const body = await request.json();
    const { slug } = body;
    
    console.log('Slug recebido:', slug);

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { available: false, error: 'Slug inválido' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.toLowerCase().trim();
    console.log('Slug normalizado:', normalizedSlug);
    
    if (normalizedSlug.length < 3) {
      return NextResponse.json({
        available: false,
        error: 'Slug deve ter pelo menos 3 caracteres'
      });
    }

    console.log('Verificando se slug existe...');
    // Verificar se slug já existe
    const existingCompany = await prisma.company.findFirst({
      where: {
        slug: normalizedSlug
      },
      select: { id: true }
    });
    
    console.log('Empresa encontrada:', !!existingCompany);

    const result = {
      available: !existingCompany,
      slug: normalizedSlug
    };
    
    console.log('Resultado:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('ERRO na simple slug check:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'Sem stack');
    return NextResponse.json(
      { available: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}