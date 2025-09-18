import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendCourseCompletionEmail } from '@/lib/email';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { id } = await params;
    const enrollmentId = id;

    // Buscar candidato
    const candidate = await prisma.candidate.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidato não encontrado' }, { status: 404 });
    }

    // Buscar progresso do curso
    const courseProgress = await prisma.courseProgress.findFirst({
      where: {
        id: enrollmentId,
        candidateId: candidate.id
      },
      include: {
        course: true
      }
    });

    if (!courseProgress) {
      return NextResponse.json({ error: 'Progresso do curso não encontrado' }, { status: 404 });
    }

    if (courseProgress.isCompleted) {
      return NextResponse.json({ error: 'Curso já foi concluído' }, { status: 400 });
    }

    // Verificar se já existe certificado
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        candidateId: candidate.id,
        courseId: courseProgress.courseId
      }
    });

    if (existingCertificate) {
      return NextResponse.json({ error: 'Certificado já foi emitido para este curso' }, { status: 400 });
    }

    // Atualizar progresso para concluído
    const updatedCourseProgress = await prisma.courseProgress.update({
      where: { id: enrollmentId },
      data: {
        isCompleted: true,
        progress: 100
      }
    });

    // Gerar certificado
    const certificate = await prisma.certificate.create({
      data: {
        candidateId: candidate.id,
        courseId: courseProgress.courseId,
        issuedAt: new Date(),
        code: `CERT-${Date.now()}-${candidate.id}-${courseProgress.courseId}`
      },
      include: {
        course: true,
        candidate: {
          include: {
            user: true
          }
        }
      }
    });

    // Send course completion email (don't block completion if email fails)
    try {
      await sendCourseCompletionEmail(
        candidate.user.email,
        candidate.user.name,
        certificate.course.title,
        certificate.code
      )
    } catch (emailError) {
      console.error('Failed to send course completion email:', emailError)
      // Continue with successful completion even if email fails
    }

    return NextResponse.json({
      message: 'Curso concluído com sucesso',
      courseProgress: updatedCourseProgress,
      certificate: {
        id: certificate.id,
        code: certificate.code,
        issuedAt: certificate.issuedAt,
        course: {
          title: certificate.course.title,
          description: certificate.course.description,
          duration: certificate.course.duration
        }
      }
    });

  } catch (error) {
    console.error('Erro ao concluir curso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}