const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testInsightsAPI() {
  try {
    // Simular a lógica da API de insights
    const companyId = 'cmfl8r95y000171o0kfmxjvif' // ID da empresa de teste
    
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    
    console.log(`=== TESTANDO API INSIGHTS ===`)
    console.log(`Ano: ${year}, Mês: ${month}`)
    
    // Calcular datas do período atual e anterior
    const currentPeriodStart = new Date(year, month - 1, 1)
    const currentPeriodEnd = new Date(year, month, 0, 23, 59, 59)
    
    const previousPeriodStart = new Date(year, month - 2, 1)
    const previousPeriodEnd = new Date(year, month - 1, 0, 23, 59, 59)

    // Se for janeiro, o período anterior é dezembro do ano anterior
    if (month === 1) {
      previousPeriodStart.setFullYear(year - 1, 11, 1)
      previousPeriodEnd.setFullYear(year - 1, 11, 31, 23, 59, 59)
    }
    
    console.log(`\nPeríodo atual: ${currentPeriodStart.toLocaleDateString()} - ${currentPeriodEnd.toLocaleDateString()}`)
    console.log(`Período anterior: ${previousPeriodStart.toLocaleDateString()} - ${previousPeriodEnd.toLocaleDateString()}`)

    // Buscar dados do período atual
    const [currentJobs, currentApplications] = await Promise.all([
      prisma.job.findMany({
        where: {
          companyId: companyId,
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        },
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        }
      }),
      prisma.application.findMany({
        where: {
          job: {
            companyId: companyId
          },
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        }
      })
    ])

    // Buscar dados do período anterior
    const [previousJobs, previousApplications] = await Promise.all([
      prisma.job.findMany({
        where: {
          companyId: companyId,
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        },
        include: {
          _count: {
            select: {
              applications: true
            }
          }
        }
      }),
      prisma.application.findMany({
        where: {
          job: {
            companyId: companyId
          },
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd
          }
        }
      })
    ])

    // Calcular métricas do período atual
    const currentMetrics = {
      jobsPublished: currentJobs.length,
      totalApplications: currentApplications.length,
      approvedCandidates: currentApplications.filter(app => app.status === 'APPROVED').length,
      participatingCandidates: currentApplications.filter(app => app.status === 'PARTICIPATING').length,
      rejectedApplications: currentApplications.filter(app => app.status === 'REJECTED').length,
      pendingApplications: currentApplications.filter(app => app.status === 'PENDING').length
    }

    // Calcular métricas do período anterior
    const previousMetrics = {
      jobsPublished: previousJobs.length,
      totalApplications: previousApplications.length,
      approvedCandidates: previousApplications.filter(app => app.status === 'APPROVED').length,
      participatingCandidates: previousApplications.filter(app => app.status === 'PARTICIPATING').length,
      rejectedApplications: previousApplications.filter(app => app.status === 'REJECTED').length,
      pendingApplications: previousApplications.filter(app => app.status === 'PENDING').length
    }

    // Calcular variações percentuais
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }
    
    console.log(`\n=== MÉTRICAS PERÍODO ATUAL ===`)
    console.log(`Vagas publicadas: ${currentMetrics.jobsPublished}`)
    console.log(`Total candidaturas: ${currentMetrics.totalApplications}`)
    console.log(`Candidatos aprovados: ${currentMetrics.approvedCandidates}`)
    console.log(`Candidatos participantes: ${currentMetrics.participatingCandidates}`)
    
    console.log(`\n=== MÉTRICAS PERÍODO ANTERIOR ===`)
    console.log(`Vagas publicadas: ${previousMetrics.jobsPublished}`)
    console.log(`Total candidaturas: ${previousMetrics.totalApplications}`)
    console.log(`Candidatos aprovados: ${previousMetrics.approvedCandidates}`)
    console.log(`Candidatos participantes: ${previousMetrics.participatingCandidates}`)
    
    console.log(`\n=== VARIAÇÕES PERCENTUAIS ===`)
    console.log(`Vagas publicadas: ${calculatePercentageChange(currentMetrics.jobsPublished, previousMetrics.jobsPublished).toFixed(1)}%`)
    console.log(`Total candidaturas: ${calculatePercentageChange(currentMetrics.totalApplications, previousMetrics.totalApplications).toFixed(1)}%`)
    console.log(`Candidatos aprovados: ${calculatePercentageChange(currentMetrics.approvedCandidates, previousMetrics.approvedCandidates).toFixed(1)}%`)
    console.log(`Candidatos participantes: ${calculatePercentageChange(currentMetrics.participatingCandidates, previousMetrics.participatingCandidates).toFixed(1)}%`)

    const insights = {
      period: {
        current: {
          year,
          month,
          label: new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        },
        previous: {
          year: month === 1 ? year - 1 : year,
          month: month === 1 ? 12 : month - 1,
          label: new Date(month === 1 ? year - 1 : year, month === 1 ? 11 : month - 2).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        }
      },
      metrics: {
        current: currentMetrics,
        previous: previousMetrics,
        changes: {
          jobsPublished: calculatePercentageChange(currentMetrics.jobsPublished, previousMetrics.jobsPublished),
          totalApplications: calculatePercentageChange(currentMetrics.totalApplications, previousMetrics.totalApplications),
          approvedCandidates: calculatePercentageChange(currentMetrics.approvedCandidates, previousMetrics.approvedCandidates),
          participatingCandidates: calculatePercentageChange(currentMetrics.participatingCandidates, previousMetrics.participatingCandidates)
        }
      },
      chartData: {
        comparison: [
          {
            metric: 'Vagas Publicadas',
            current: currentMetrics.jobsPublished,
            previous: previousMetrics.jobsPublished
          },
          {
            metric: 'Total Candidaturas',
            current: currentMetrics.totalApplications,
            previous: previousMetrics.totalApplications
          },
          {
            metric: 'Candidatos Aprovados',
            current: currentMetrics.approvedCandidates,
            previous: previousMetrics.approvedCandidates
          },
          {
            metric: 'Candidatos Participantes',
            current: currentMetrics.participatingCandidates,
            previous: previousMetrics.participatingCandidates
          }
        ]
      }
    }
    
    console.log(`\n=== RESULTADO FINAL DA API ===`)
    console.log(JSON.stringify(insights, null, 2))
    
  } catch (error) {
    console.error('Erro ao testar API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testInsightsAPI()