const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testDirectAPI() {
  try {
    console.log('🔍 Testando acesso direto à API...')
    
    // 1. Verificar se existe usuário empresa
    const companyUser = await prisma.user.findFirst({
      where: { role: 'COMPANY' },
      include: { company: true }
    })
    
    if (!companyUser) {
      console.log('❌ Nenhum usuário empresa encontrado')
      return
    }
    
    console.log('✅ Usuário empresa encontrado:', {
      id: companyUser.id,
      email: companyUser.email,
      companyId: companyUser.company?.id
    })
    
    // 2. Verificar se a empresa tem dados
    const company = await prisma.company.findUnique({
      where: { id: companyUser.company.id }
    })
    
    console.log('✅ Dados da empresa:', {
      id: company.id,
      name: company.name
    })
    
    // 3. Verificar jobs da empresa
    const jobs = await prisma.job.findMany({
      where: { companyId: company.id },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    })
    
    console.log(`✅ Jobs encontrados: ${jobs.length}`)
    jobs.forEach(job => {
      console.log(`  - ${job.title}: ${job._count.applications} candidaturas`)
    })
    
    // 4. Verificar candidaturas
    const applications = await prisma.application.findMany({
      where: {
        job: { companyId: company.id }
      }
    })
    
    console.log(`✅ Total de candidaturas: ${applications.length}`)
    
    // 5. Simular chamada da API de insights
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    
    console.log(`\n🔍 Simulando API insights para ${currentMonth}/${currentYear}...`)
    
    // Calcular datas do período atual
    const currentPeriodStart = new Date(currentYear, currentMonth - 1, 1)
    const currentPeriodEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59)
    
    console.log('📅 Período atual:', {
      start: currentPeriodStart.toISOString(),
      end: currentPeriodEnd.toISOString()
    })
    
    // Buscar dados do período atual
    const currentJobs = await prisma.job.findMany({
      where: {
        companyId: company.id,
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        }
      }
    })
    
    const currentApplications = await prisma.application.findMany({
      where: {
        job: {
          companyId: company.id
        },
        createdAt: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        }
      }
    })
    
    console.log('📊 Métricas do período atual:', {
      jobsPublished: currentJobs.length,
      totalApplications: currentApplications.length,
      approvedCandidates: currentApplications.filter(app => app.status === 'APPROVED').length,
      participatingCandidates: currentApplications.filter(app => app.status === 'PARTICIPATING').length
    })
    
    console.log('\n✅ Teste concluído! A API deve funcionar corretamente.')
    console.log('\n📝 Para testar no navegador:')
    console.log(`1. Acesse: http://localhost:3000/login`)
    console.log(`2. Faça login com: ${companyUser.email}`)
    console.log(`3. Acesse: http://localhost:3000/empresa`)
    console.log(`4. Os cards de performance devem aparecer`)
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDirectAPI()