import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyTestApplications() {
  try {
    console.log('🔍 Verificando candidaturas dos usuários teste...')
    
    // Buscar todos os candidatos teste
    const testCandidates = await prisma.candidate.findMany({
      where: {
        user: {
          email: {
            endsWith: '@teste.com'
          }
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        applications: {
          include: {
            job: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    console.log(`\n📊 Resumo das candidaturas:`)
    console.log(`Total de candidatos teste: ${testCandidates.length}`)
    
    let totalApplications = 0
    
    testCandidates.forEach(candidate => {
      const applicationsCount = candidate.applications.length
      totalApplications += applicationsCount
      
      console.log(`\n👤 ${candidate.user.name} (${candidate.user.email})`)
      console.log(`   📝 ${applicationsCount} candidatura(s):`)
      
      candidate.applications.forEach(app => {
        console.log(`     - ${app.job.title} (${app.job.company.name}) - Status: ${app.status}`)
        if (app.message) {
          console.log(`       Mensagem: "${app.message.substring(0, 50)}..."`)
        }
      })
    })

    console.log(`\n✅ Total de candidaturas criadas: ${totalApplications}`)
    
    // Verificar vagas e suas candidaturas
    console.log('\n🎯 Candidaturas por vaga:')
    const jobsWithApplications = await prisma.job.findMany({
      where: {
        status: 'APPROVED',
        isActive: true
      },
      include: {
        company: {
          select: {
            name: true
          }
        },
        applications: {
          include: {
            candidate: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          where: {
            candidate: {
              user: {
                email: {
                  endsWith: '@teste.com'
                }
              }
            }
          }
        }
      }
    })

    jobsWithApplications.forEach(job => {
      console.log(`\n🏢 ${job.title} (${job.company.name})`)
      console.log(`   📊 ${job.applications.length} candidatura(s) de usuários teste:`)
      
      job.applications.forEach(app => {
        console.log(`     - ${app.candidate.user.name} (${app.status})`)
      })
    })
    
    console.log('\n✅ Verificação concluída!')
    
  } catch (error) {
    console.error('❌ Erro ao verificar candidaturas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTestApplications()