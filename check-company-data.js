const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCompanyData() {
  try {
    // Buscar empresa com vagas e candidaturas
    const company = await prisma.company.findFirst({
      include: {
        jobs: {
          include: {
            applications: true,
            _count: {
              select: {
                applications: true
              }
            }
          }
        }
      }
    })

    console.log('=== DADOS DA EMPRESA ===')
    if (company) {
      console.log(`Empresa: ${company.name}`)
      console.log(`ID: ${company.id}`)
      console.log(`Total de vagas: ${company.jobs.length}`)
      
      console.log('\n=== VAGAS ===')
      company.jobs.forEach((job, index) => {
        console.log(`${index + 1}. ${job.title}`)
        console.log(`   Status: ${job.status}`)
        console.log(`   Criada em: ${job.createdAt}`)
        console.log(`   Candidaturas: ${job.applications.length}`)
        console.log(`   Candidaturas por status:`)
        
        const statusCount = job.applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1
          return acc
        }, {})
        
        Object.entries(statusCount).forEach(([status, count]) => {
          console.log(`     ${status}: ${count}`)
        })
        console.log('')
      })
    } else {
      console.log('Nenhuma empresa encontrada no banco de dados')
    }

    // Verificar candidaturas do mês atual
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const currentMonthStart = new Date(currentYear, currentMonth, 1)
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)
    
    console.log('\n=== CANDIDATURAS DO MÊS ATUAL ===')
    console.log(`Período: ${currentMonthStart.toLocaleDateString()} - ${currentMonthEnd.toLocaleDateString()}`)
    
    if (company) {
      const currentMonthApplications = await prisma.application.findMany({
        where: {
          job: {
            companyId: company.id
          },
          createdAt: {
            gte: currentMonthStart,
            lte: currentMonthEnd
          }
        }
      })
      
      console.log(`Total de candidaturas este mês: ${currentMonthApplications.length}`)
      
      const statusCount = currentMonthApplications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {})
      
      Object.entries(statusCount).forEach(([status, count]) => {
        console.log(`${status}: ${count}`)
      })
    }
    
  } catch (error) {
    console.error('Erro ao verificar dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCompanyData()