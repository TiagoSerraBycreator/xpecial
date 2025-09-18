import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        { error: 'ID do curso é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar candidato do usuário
    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o curso existe
    const course = await prisma.course.findUnique({
      where: {
        id: courseId
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o candidato já está matriculado no curso
    const existingCourseProgress = await prisma.courseProgress.findFirst({
      where: {
        candidateId: candidate.id,
        courseId: courseId
      }
    });

    if (existingCourseProgress) {
      return NextResponse.json({ error: 'Candidato já está matriculado neste curso' }, { status: 400 });
    }

    // Criar progresso do curso
    const courseProgress = await prisma.courseProgress.create({
      data: {
        candidateId: candidate.id,
        courseId: courseId,
        progress: 0,
        isCompleted: false
      },
      include: {
        course: {
          select: {
            title: true,
            duration: true
          }
        }
      }
    })

    return NextResponse.json({
      ...courseProgress,
      createdAt: courseProgress.createdAt.toISOString(),
      updatedAt: courseProgress.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Erro ao criar matrícula:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Buscar candidato do usuário
    const candidate = await prisma.candidate.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidato não encontrado' },
        { status: 404 }
      )
    }

    // Buscar progresso dos cursos do candidato
    const courseProgresses = await prisma.courseProgress.findMany({
      where: {
        candidateId: candidate.id
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            duration: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Formatar datas
    const formattedCourseProgresses = courseProgresses.map(courseProgress => ({
      ...courseProgress,
      createdAt: courseProgress.createdAt.toISOString(),
      updatedAt: courseProgress.updatedAt.toISOString()
    }))

    return NextResponse.json({
      courseProgresses: formattedCourseProgresses
    })
  } catch (error) {
    console.error('Erro ao buscar matrículas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}