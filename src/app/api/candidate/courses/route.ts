import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '9')
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

    // Buscar cursos com contagem total
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
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
      createdAt: course.createdAt.toISOString()
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