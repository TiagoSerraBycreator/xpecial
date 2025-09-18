import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''

    const skip = (page - 1) * limit

    // Construir filtros
    const where: any = {}

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    // Buscar cursos com contagem total e estatísticas
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          _count: {
            select: {
              progress: true,
              certificates: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.course.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    // Formatar datas
    const formattedCourses = courses.map(course => ({
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString()
    }))

    return NextResponse.json({
      courses: formattedCourses,
      totalCount,
      totalPages,
      currentPage: page
    })
  } catch (error) {
    console.error('Erro ao buscar cursos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      content,
      duration,
      difficulty,
      category
    } = body

    // Validação básica
    if (!title || !description || !content || !duration || !difficulty || !category) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    if (duration <= 0) {
      return NextResponse.json(
        { error: 'Duração deve ser maior que zero' },
        { status: 400 }
      )
    }

    const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Dificuldade inválida' },
        { status: 400 }
      )
    }

    const validCategories = ['PROGRAMMING', 'DESIGN', 'MARKETING', 'BUSINESS', 'DATA_SCIENCE']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Categoria inválida' },
        { status: 400 }
      )
    }

    // Criar curso
    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        duration: parseInt(duration)
      }
    })

    return NextResponse.json({
      ...course,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString()
    })
  } catch (error) {
    console.error('Erro ao criar curso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}