import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateNumber = searchParams.get('number');

    if (!certificateNumber) {
      return NextResponse.json({ error: 'Número do certificado é obrigatório' }, { status: 400 });
    }

    // Buscar certificado
    const certificate = await prisma.certificate.findUnique({
      where: {
        code: certificateNumber
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            duration: true
          }
        },
        candidate: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        message: 'Certificado não encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      valid: true,
      certificate: {
        id: certificate.id,
        code: certificate.code,
        issuedAt: certificate.issuedAt,
        candidate: {
          name: certificate.candidate.user.name,
          email: certificate.candidate.user.email
        },
        course: {
          title: certificate.course.title,
          description: certificate.course.description,
          duration: certificate.course.duration
        }
      }
    });

  } catch (error) {
    console.error('Erro ao validar certificado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificateNumber } = body;

    if (!certificateNumber) {
      return NextResponse.json({ error: 'Número do certificado é obrigatório' }, { status: 400 });
    }

    // Buscar certificado
    const certificate = await prisma.certificate.findUnique({
      where: {
        code: certificateNumber
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            duration: true
          }
        },
        candidate: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!certificate) {
      return NextResponse.json({
        valid: false,
        message: 'Certificado não encontrado ou inválido'
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'Certificado válido',
      certificate: {
        id: certificate.id,
        code: certificate.code,
        issuedAt: certificate.issuedAt,
        candidate: {
          name: certificate.candidate.user.name,
          email: certificate.candidate.user.email
        },
        course: {
          title: certificate.course.title,
          description: certificate.course.description,
          duration: certificate.course.duration
        }
      }
    });

  } catch (error) {
    console.error('Erro ao validar certificado:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}