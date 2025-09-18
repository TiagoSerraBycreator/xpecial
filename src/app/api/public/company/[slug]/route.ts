import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug da empresa é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar empresa pelo slug
    const company = await prisma.company.findUnique({
      where: {
        slug: slug.toLowerCase()
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        sector: true,
        description: true,
        website: true,
        isApproved: true,
        createdAt: true,
        _count: {
          select: {
            jobs: {
              where: {
                status: 'APPROVED',
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a empresa está aprovada
    if (!company.isApproved) {
      return NextResponse.json(
        { error: 'Empresa não está aprovada para visualização pública' },
        { status: 403 }
      );
    }

    // Buscar estatísticas básicas da empresa
    const [totalJobs, activeJobs, totalApplications] = await Promise.all([
      // Total de vagas já publicadas
      prisma.job.count({
        where: {
          companyId: company.id,
          status: 'APPROVED'
        }
      }),
      // Vagas ativas atualmente
      prisma.job.count({
        where: {
          companyId: company.id,
          status: 'APPROVED',
          isActive: true
        }
      }),
      // Total de candidaturas recebidas
      prisma.application.count({
        where: {
          job: {
            companyId: company.id
          }
        }
      })
    ]);

    const companyData = {
      ...company,
      createdAt: company.createdAt.toISOString(),
      stats: {
        totalJobs,
        activeJobs,
        totalApplications
      }
    };

    return NextResponse.json(companyData);
  } catch (error) {
    console.error('Erro ao buscar dados públicos da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}