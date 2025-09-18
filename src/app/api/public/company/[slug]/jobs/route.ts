import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const { searchParams } = new URL(request.url);
    
    const period = searchParams.get('period') || 'all'; // 7, 30, 60, 180, year, all
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

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
        isApproved: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    if (!company.isApproved) {
      return NextResponse.json(
        { error: 'Empresa não está aprovada para visualização pública' },
        { status: 403 }
      );
    }

    // Calcular data de início baseada no período
    let startDate: Date | undefined;
    const now = new Date();
    
    switch (period) {
      case '7':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60':
        startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '180':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1); // Início do ano atual
        break;
      case 'all':
      default:
        startDate = undefined; // Sem filtro de data
        break;
    }

    // Construir filtros para a busca
    const whereClause: any = {
      companyId: company.id,
      status: 'APPROVED',
      isActive: true
    };

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate
      };
    }

    // Buscar vagas com contagem total
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        select: {
          id: true,
          title: true,
          description: true,
          requirements: true,
          location: true,
          workMode: true,
          salaryMin: true,
          salaryMax: true,
          city: true,
          state: true,
          sector: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              applications: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.job.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Formatar dados das vagas
    const formattedJobs = jobs.map(job => {
      // Formatar localização
      let location = 'Remoto';
      if (job.city && job.state) {
        location = `${job.city}, ${job.state}`;
      } else if (job.city) {
        location = job.city;
      } else if (job.state) {
        location = job.state;
      } else if (job.location) {
        location = job.location;
      }

      // Formatar salário
      let salaryRange = null;
      if (job.salaryMin && job.salaryMax) {
        salaryRange = `R$ ${job.salaryMin.toLocaleString()} - R$ ${job.salaryMax.toLocaleString()}`;
      } else if (job.salaryMin) {
        salaryRange = `A partir de R$ ${job.salaryMin.toLocaleString()}`;
      } else if (job.salaryMax) {
        salaryRange = `Até R$ ${job.salaryMax.toLocaleString()}`;
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location,
        workMode: job.workMode,
        salaryRange,
        sector: job.sector,
        applicationsCount: job._count.applications,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString()
      };
    });

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        total: totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filters: {
        period,
        appliedFilters: {
          period: period !== 'all' ? period : null,
          startDate: startDate?.toISOString() || null
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vagas públicas da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}