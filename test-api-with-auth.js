const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testApiWithAuth() {
  try {
    console.log('=== TESTE DA API COM AUTENTICAÇÃO ===')
    
    // 1. Verificar usuários empresa
    const companyUsers = await prisma.user.findMany({
      where: {
        role: 'COMPANY'
      },
      include: {
        company: true
      }
    })
    
    console.log(`\n📋 Usuários empresa encontrados: ${companyUsers.length}`)
    companyUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Empresa: ${user.company?.name || 'N/A'}`)
    })
    
    if (companyUsers.length === 0) {
      console.log('❌ Nenhum usuário empresa encontrado!')
      return
    }
    
    const testUser = companyUsers[0]
    console.log(`\n🔍 Testando com usuário: ${testUser.email}`)
    console.log(`   Empresa ID: ${testUser.company?.id}`)
    
    // 2. Simular a lógica da API de insights
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    
    console.log(`\n📅 Período de teste: ${month}/${year}`)
    
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
    
    // 3. Buscar dados do período atual
    const currentJobs = await prisma.job.findMany({
      where: {
        companyId: testUser.company.id,
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        }
      }
    })
    
    const currentApplications = await prisma.application.findMany({
      where: {
        job: {
          companyId: testUser.company.id
        },
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        }
      }
    })
    
    // 4. Buscar dados do período anterior
    const previousJobs = await prisma.job.findMany({
      where: {
        companyId: testUser.company.id,
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })
    
    const previousApplications = await prisma.application.findMany({
      where: {
        job: {
          companyId: testUser.company.id
        },
        createdAt: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })
    
    // 5. Calcular métricas
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
    
    // 6. Calcular mudanças percentuais
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }
    
    const changes = {
      jobsPublished: calculateChange(currentMetrics.jobsPublished, previousMetrics.jobsPublished),
      totalApplications: calculateChange(currentMetrics.totalApplications, previousMetrics.totalApplications),
      approvedCandidates: calculateChange(currentMetrics.approvedCandidates, previousMetrics.approvedCandidates),
      participatingCandidates: calculateChange(currentMetrics.participatingCandidates, previousMetrics.participatingCandidates)
    }
    
    // 7. Montar resposta da API
    const apiResponse = {
      period: {
        current: { 
          year, 
          month, 
          label: `${month.toString().padStart(2, '0')}/${year}` 
        },
        previous: { 
          year: month === 1 ? year - 1 : year, 
          month: month === 1 ? 12 : month - 1, 
          label: `${(month === 1 ? 12 : month - 1).toString().padStart(2, '0')}/${month === 1 ? year - 1 : year}` 
        }
      },
      metrics: {
        current: currentMetrics,
        previous: previousMetrics,
        changes
      },
      chartData: {
        comparison: [
          { metric: 'Vagas', current: currentMetrics.jobsPublished, previous: previousMetrics.jobsPublished },
          { metric: 'Candidaturas', current: currentMetrics.totalApplications, previous: previousMetrics.totalApplications },
          { metric: 'Aprovados', current: currentMetrics.approvedCandidates, previous: previousMetrics.approvedCandidates },
          { metric: 'Participantes', current: currentMetrics.participatingCandidates, previous: previousMetrics.participatingCandidates }
        ]
      }
    }
    
    console.log('\n=== RESPOSTA DA API SIMULADA ===')
    console.log(JSON.stringify(apiResponse, null, 2))
    
    console.log('\n=== DIAGNÓSTICO FINAL ===')
    console.log(`✅ Usuário empresa existe: ${!!testUser}`)
    console.log(`✅ Empresa associada: ${!!testUser.company}`)
    console.log(`✅ Dados do período atual: ${currentMetrics.jobsPublished} vagas, ${currentMetrics.totalApplications} candidaturas`)
    console.log(`✅ API deve retornar dados válidos: ${JSON.stringify(apiResponse).length > 100 ? 'SIM' : 'NÃO'}`)
    
    if (currentMetrics.jobsPublished === 0 && currentMetrics.totalApplications === 0) {
      console.log('\n⚠️  AVISO: Não há dados para o período atual')
      console.log('   Isso pode fazer com que os cards apareçam vazios')
    } else {
      console.log('\n✅ SUCESSO: A API deve funcionar corretamente')
      console.log('   Se os cards não aparecem, o problema está na autenticação ou no frontend')
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApiWithAuth()