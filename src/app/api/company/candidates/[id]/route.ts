import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'COMPANY') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const resolvedParams = await params;

    // Verificar se a empresa existe
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    const candidateId = resolvedParams.id;

    // Buscar o perfil do candidato
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        applications: {
          include: {
            job: {
              include: {
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Verificar se a empresa tem permissão para ver este candidato
    // (o candidato deve ter se candidatado a pelo menos uma vaga da empresa)
    const hasApplicationToCompany = candidate.applications.some(
      (application) => application.job.companyId === company.id
    );

    if (!hasApplicationToCompany) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Filtrar apenas as candidaturas para vagas desta empresa
    const filteredApplications = candidate.applications.filter(
      (application) => application.job.companyId === company.id
    );

    const candidateData = {
      ...candidate,
      applications: filteredApplications,
    };

    return NextResponse.json(candidateData);
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}