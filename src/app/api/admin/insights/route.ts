import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays, subMonths, subYears, eachDayOfInterval, format } from 'date-fns'

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
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')
    const comparison = searchParams.get('comparison') || 'previous'

    if (!fromParam || !toParam) {
      return NextResponse.json(
        { error: 'Parâmetros de data são obrigatórios' },
        { status: 400 }
      )
    }

    const from = startOfDay(new Date(fromParam))
    const to = endOfDay(new Date(toParam))

    return await processInsights(from, to, comparison)
  } catch (error) {
    console.error('Erro ao buscar insights:', error)
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
    const { dateRange, comparisonPeriod } = body

    if (!dateRange || !dateRange.from || !dateRange.to) {
      return NextResponse.json(
        { error: 'Parâmetros de data são obrigatórios' },
        { status: 400 }
      )
    }

    const from = startOfDay(new Date(dateRange.from))
    const to = endOfDay(new Date(dateRange.to))
    const comparison = comparisonPeriod || 'previous'

    return await processInsights(from, to, comparison)
  } catch (error) {
    console.error('Erro ao buscar insights:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function processInsights(from: Date, to: Date, comparison: string) {

  // Calcular período de comparação
  const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
  let comparisonFrom: Date
  let comparisonTo: Date

  if (comparison === 'same_last_year') {
    comparisonFrom = subYears(from, 1)
    comparisonTo = subYears(to, 1)
  } else {
    // Período anterior
    comparisonTo = subDays(from, 1)
    comparisonFrom = subDays(comparisonTo, daysDiff - 1)
  }

    // Buscar dados de usuários
    const [usersTotal, usersPeriod, usersComparison] = await Promise.all([
      // Total geral de usuários
      prisma.user.count({
        where: {
          role: { in: ['CANDIDATE', 'COMPANY'] }
        }
      }),
      // Usuários no período selecionado
      prisma.user.count({
        where: {
          role: { in: ['CANDIDATE', 'COMPANY'] },
          createdAt: {
            gte: from,
            lte: to
          }
        }
      }),
      // Usuários no período de comparação
      prisma.user.count({
        where: {
          role: { in: ['CANDIDATE', 'COMPANY'] },
          createdAt: {
            gte: comparisonFrom,
            lte: comparisonTo
          }
        }
      })
    ])

    // Buscar dados de empresas
    const [companiesTotal, companiesPeriod, companiesComparison] = await Promise.all([
      // Total geral de empresas
      prisma.user.count({
        where: {
          role: 'COMPANY'
        }
      }),
      // Empresas no período selecionado
      prisma.user.count({
        where: {
          role: 'COMPANY',
          createdAt: {
            gte: from,
            lte: to
          }
        }
      }),
      // Empresas no período de comparação
      prisma.user.count({
        where: {
          role: 'COMPANY',
          createdAt: {
            gte: comparisonFrom,
            lte: comparisonTo
          }
        }
      })
    ])

    // Gerar dados do gráfico por dia
    const days = eachDayOfInterval({ start: from, end: to })
    
    // Buscar usuários por dia
    const usersChartData = await Promise.all(
      days.map(async (day) => {
        const count = await prisma.user.count({
          where: {
            role: { in: ['CANDIDATE', 'COMPANY'] },
            createdAt: {
              gte: startOfDay(day),
              lte: endOfDay(day)
            }
          }
        })
        return {
          date: format(day, 'yyyy-MM-dd'),
          count
        }
      })
    )

    // Buscar empresas por dia
    const companiesChartData = await Promise.all(
      days.map(async (day) => {
        const count = await prisma.user.count({
          where: {
            role: 'COMPANY',
            createdAt: {
              gte: startOfDay(day),
              lte: endOfDay(day)
            }
          }
        })
        return {
          date: format(day, 'yyyy-MM-dd'),
          count
        }
      })
    )

    // Calcular crescimento percentual
    const usersGrowth = usersComparison > 0 
      ? ((usersPeriod - usersComparison) / usersComparison) * 100 
      : usersPeriod > 0 ? 100 : 0

    const companiesGrowth = companiesComparison > 0 
      ? ((companiesPeriod - companiesComparison) / companiesComparison) * 100 
      : companiesPeriod > 0 ? 100 : 0

    const insights = {
      users: {
        total: usersTotal,
        period: usersPeriod,
        growth: usersGrowth,
        chartData: usersChartData
      },
      companies: {
        total: companiesTotal,
        period: companiesPeriod,
        growth: companiesGrowth,
        chartData: companiesChartData
      },
      metadata: {
        period: {
          from: format(from, 'yyyy-MM-dd'),
          to: format(to, 'yyyy-MM-dd')
        },
        comparison: {
          type: comparison,
          from: format(comparisonFrom, 'yyyy-MM-dd'),
          to: format(comparisonTo, 'yyyy-MM-dd')
        }
      }
    }

  return NextResponse.json(insights)
}