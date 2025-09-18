const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugInsights() {
  try {
    console.log('=== DEBUG INSIGHTS API ===')
    
    // 1. Verificar se existe empresa
    const company = await prisma.company.findFirst({
      include: {
        user: true
      }
    })
    
    if (!company) {
      console.log('❌ Nenhuma empresa encontrada')
      return
    }
    
    console.log(`✅ Empresa encontrada: ${company.name}`)
    console.log(`   Usuário: ${company.user.email}`)
    console.log(`   ID da empresa: ${company.id}`)
    
    // 2. Verificar dados do mês atual
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    
    console.log(`\n=== VERIFICANDO DADOS PARA ${month}/${year} ===`)
    
    // Período atual
    const currentPeriodStart = new Date(year, month - 1, 1)
    const currentPeriodEnd = new Date(year, month, 0, 23, 59, 59)
    
    // Período anterior
    const previousPeriodStart = new Date(year, month - 2, 1)
    const previousPeriodEnd = new Date(year, month - 1, 0, 23, 59, 59)
    
    if (month === 1) {
      previousPeriodStart.setFullYear(year - 1, 11, 1)
      previousPeriodEnd.setFullYear(year - 1, 11, 31, 23, 59, 59)
    }
    
    console.log(`Período atual: ${currentPeriodStart.toISOString()} - ${currentPeriodEnd.toISOString()}`)
    console.log(`Período anterior: ${previousPeriodStart.toISOString()} - ${previousPeriodEnd.toISOString()}`)
    
    // 3. Buscar vagas do período atual
    const currentJobs = await prisma.job.findMany({
      where: {
        companyId: company.id,
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        }
      }
    })
    
    console.log(`\n📊 Vagas no período atual: ${currentJobs.length}`)
    currentJobs.forEach(job => {
      console.log(`   - ${job.title} (${job.status}) - ${job.createdAt}`)
    })
    
    // 4. Buscar candidaturas do período atual
    const currentApplications = await prisma.application.findMany({
      where: {
        job: {
          companyId: company.id
        },
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        }
      },
      include: {
        job: {
          select: {
            title: true
          }
        }
      }
    })
    
    console.log(`\n📝 Candidaturas no período atual: ${currentApplications.length}`)
    
    const statusCounts = currentApplications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})
    
    console.log('   Status das candidaturas:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`)
    })
    
    // 5. Buscar dados do período anterior
    const previousJobs = await prisma.job.findMany({
      where: {
        companyId: company.id,
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })
    
    const previousApplications = await prisma.application.findMany({
      where: {
        job: {
          companyId: company.id
        },
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })
    
    console.log(`\n📊 Vagas no período anterior: ${previousJobs.length}`)
    console.log(`📝 Candidaturas no período anterior: ${previousApplications.length}`)
    
    // 6. Calcular métricas finais
    const currentMetrics = {
      jobsPublished: currentJobs.length,
      totalApplications: currentApplications.length,
      approvedCandidates: currentApplications.filter(app => app.status === 'APPROVED').length,
      participatingCandidates: currentApplications.filter(app => app.status === 'PARTICIPATING').length
    }
    
    const previousMetrics = {
      jobsPublished: previousJobs.length,
      totalApplications: previousApplications.length,
      approvedCandidates: previousApplications.filter(app => app.status === 'APPROVED').length,
      participatingCandidates: previousApplications.filter(app => app.status === 'PARTICIPATING').length
    }
    
    console.log(`\n=== MÉTRICAS FINAIS ===`)
    console.log('Período atual:')
    console.log(`  Vagas publicadas: ${currentMetrics.jobsPublished}`)
    console.log(`  Total candidaturas: ${currentMetrics.totalApplications}`)
    console.log(`  Candidatos aprovados: ${currentMetrics.approvedCandidates}`)
    console.log(`  Candidatos participantes: ${currentMetrics.participatingCandidates}`)
    
    console.log('\nPeríodo anterior:')
    console.log(`  Vagas publicadas: ${previousMetrics.jobsPublished}`)
    console.log(`  Total candidaturas: ${previousMetrics.totalApplications}`)
    console.log(`  Candidatos aprovados: ${previousMetrics.approvedCandidates}`)
    console.log(`  Candidatos participantes: ${previousMetrics.participatingCandidates}`)
    
    // 7. Verificar se os dados são válidos para exibição
    const hasValidData = currentMetrics.jobsPublished > 0 || 
                        currentMetrics.totalApplications > 0 || 
                        previousMetrics.jobsPublished > 0 || 
                        previousMetrics.totalApplications > 0
    
    console.log(`\n=== DIAGNÓSTICO ===`)
    console.log(`✅ Empresa existe: ${!!company}`)
    console.log(`✅ Dados válidos para exibição: ${hasValidData}`)
    console.log(`✅ API deve retornar dados: ${hasValidData ? 'SIM' : 'NÃO'}`)
    
    if (!hasValidData) {
      console.log('\n⚠️  PROBLEMA: Não há dados suficientes para exibir nos cards')
      console.log('   Solução: Criar mais dados de teste ou verificar filtros de data')
    } else {
      console.log('\n✅ Os dados estão corretos. O problema pode estar:')
      console.log('   1. Na autenticação (usuário não logado)')
      console.log('   2. Na chamada da API no frontend')
      console.log('   3. No estado do React (insightsData não está sendo setado)')
    }
    
  } catch (error) {
    console.error('❌ Erro no debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugInsights()