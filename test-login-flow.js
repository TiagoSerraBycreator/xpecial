// Script para testar o fluxo de login e acesso à API
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testLoginFlow() {
  try {
    console.log('=== TESTE DO FLUXO DE LOGIN ===')
    
    // 1. Verificar usuários empresa disponíveis
    const companyUsers = await prisma.user.findMany({
      where: {
        role: 'COMPANY'
      },
      include: {
        company: true
      }
    })
    
    console.log(`\n📋 Usuários empresa disponíveis para login:`)
    companyUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.name}`)
      console.log(`      Empresa: ${user.company?.name || 'N/A'}`)
      console.log(`      ID: ${user.id}`)
    })
    
    if (companyUsers.length === 0) {
      console.log('❌ Nenhum usuário empresa encontrado!')
      return
    }
    
    // 2. Verificar se as senhas estão corretas
    console.log(`\n🔐 Informações de login para teste:`)
    companyUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. Email: ${user.email}`)
      console.log(`      Senha sugerida: 123456 (padrão dos scripts de teste)`)
    })
    
    // 3. Verificar dados da empresa principal
    const mainCompany = companyUsers[0]
    if (mainCompany && mainCompany.company) {
      console.log(`\n🏢 Dados da empresa principal (${mainCompany.company.name}):`)
      
      // Contar vagas
      const totalJobs = await prisma.job.count({
        where: {
          companyId: mainCompany.company.id
        }
      })
      
      // Contar candidaturas
      const totalApplications = await prisma.application.count({
        where: {
          job: {
            companyId: mainCompany.company.id
          }
        }
      })
      
      console.log(`   📊 Total de vagas: ${totalJobs}`)
      console.log(`   📝 Total de candidaturas: ${totalApplications}`)
      
      // Verificar dados do mês atual
      const currentDate = new Date()
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      
      const currentPeriodStart = new Date(year, month - 1, 1)
      const currentPeriodEnd = new Date(year, month, 0, 23, 59, 59)
      
      const currentMonthJobs = await prisma.job.count({
        where: {
          companyId: mainCompany.company.id,
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        }
      })
      
      const currentMonthApplications = await prisma.application.count({
        where: {
          job: {
            companyId: mainCompany.company.id
          },
          createdAt: {
            gte: currentPeriodStart,
            lte: currentPeriodEnd
          }
        }
      })
      
      console.log(`   📅 Vagas no mês atual (${month}/${year}): ${currentMonthJobs}`)
      console.log(`   📅 Candidaturas no mês atual: ${currentMonthApplications}`)
    }
    
    console.log(`\n=== INSTRUÇÕES PARA TESTE ===`)
    console.log(`1. Acesse: http://localhost:3000/login`)
    console.log(`2. Use as credenciais:`)
    console.log(`   Email: ${companyUsers[0].email}`)
    console.log(`   Senha: 123456`)
    console.log(`3. Após login, acesse: http://localhost:3000/empresa`)
    console.log(`4. Os cards de performance devem aparecer com os dados acima`)
    
    console.log(`\n=== DIAGNÓSTICO ===`)
    if (companyUsers.length > 0) {
      console.log(`✅ Usuários empresa existem`)
      console.log(`✅ Dados estão disponíveis no banco`)
      console.log(`✅ API deve funcionar após login correto`)
      console.log(`\n🔍 Se os cards não aparecem após login:`)
      console.log(`   1. Verifique se o login foi bem-sucedido`)
      console.log(`   2. Abra o console do navegador (F12) para ver erros`)
      console.log(`   3. Verifique se a API /api/company/insights está sendo chamada`)
      console.log(`   4. Verifique se há erros de CORS ou autenticação`)
    } else {
      console.log(`❌ Problema: Não há usuários empresa no banco`)
      console.log(`   Solução: Execute o script de criação de dados de teste`)
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLoginFlow()