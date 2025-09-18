import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Buscar dados do candidato
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        applications: {
          include: {
            job: true
          }
        }
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 });
    }

    // Contar candidaturas
    const totalApplications = candidate.applications.length;

    // Contar entrevistas (candidaturas com status INTERVIEW ou HIRED)
    const interviews = candidate.applications.filter(
      app => app.status === 'INTERVIEW' || app.status === 'HIRED'
    ).length;

    // Como não temos tabelas para visualizações e vagas salvas ainda, retornamos 0
    // TODO: Implementar tabelas ProfileViews e SavedJobs
    const profileViews = 0;
    const savedJobs = 0;

    return NextResponse.json({
      applications: totalApplications,
      interviews,
      profileViews,
      savedJobs
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}