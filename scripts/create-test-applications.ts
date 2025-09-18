import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestApplications() {
  try {
    console.log('Buscando vagas ativas...')
    
    // Buscar vagas ativas
    const activeJobs = await prisma.job.findMany({
      where: {
        status: 'APPROVED',
        isActive: true
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    })

    if (activeJobs.length === 0) {
      console.log('❌ Nenhuma vaga ativa encontrada!')
      return
    }

    console.log(`✓ Encontradas ${activeJobs.length} vagas ativas:`)
    activeJobs.forEach(job => {
      console.log(`  - ${job.title} (${job.company.name})`)
    })

    // Buscar candidatos teste
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
        }
      }
    })

    console.log(`\n✓ Encontrados ${testCandidates.length} candidatos teste`)

    // Criar candidaturas
    console.log('\nCriando candidaturas...')
    
    const coverLetters = [
      'Tenho grande interesse nesta vaga e acredito que minha experiência pode contribuir significativamente para a equipe.',
      'Meu perfil técnico e experiência profissional se alinham perfeitamente com os requisitos desta posição.',
      'Estou muito motivado(a) para fazer parte desta empresa e contribuir com meus conhecimentos.',
      'Acredito que posso agregar valor à equipe com minha experiência e dedicação.',
      'Tenho paixão por tecnologia e estou ansioso(a) para novos desafios profissionais.',
      'Minha experiência e habilidades técnicas me tornam um(a) candidato(a) ideal para esta vaga.',
      'Estou em busca de novos desafios e esta vaga representa uma excelente oportunidade.',
      'Tenho certeza de que posso contribuir positivamente para o crescimento da empresa.'
    ]

    let applicationCount = 0

    // Para cada vaga ativa, criar candidaturas de alguns candidatos aleatórios
    for (const job of activeJobs) {
      // Embaralhar candidatos e pegar entre 3-6 candidatos por vaga
      const shuffledCandidates = testCandidates.sort(() => Math.random() - 0.5)
      const candidatesForJob = shuffledCandidates.slice(0, Math.floor(Math.random() * 4) + 3)

      for (const candidate of candidatesForJob) {
        // Verificar se já existe candidatura
        const existingApplication = await prisma.application.findFirst({
          where: {
            candidateId: candidate.id,
            jobId: job.id
          }
        })

        if (!existingApplication) {
          const randomCoverLetter = coverLetters[Math.floor(Math.random() * coverLetters.length)]
          
          await prisma.application.create({
            data: {
              candidateId: candidate.id,
              jobId: job.id,
              status: 'APPLIED',
              message: randomCoverLetter,
              consent: Math.random() > 0.3 // 70% chance de aceitar WhatsApp
            }
          })

          applicationCount++
          console.log(`  ✓ ${candidate.user.name} se candidatou para: ${job.title}`)
        }
      }
    }

    console.log(`\n✅ ${applicationCount} candidaturas criadas com sucesso!`)
    
    // Mostrar estatísticas
    console.log('\n📊 Estatísticas:')
    for (const job of activeJobs) {
      const count = await prisma.application.count({
        where: { jobId: job.id }
      })
      console.log(`  - ${job.title}: ${count} candidaturas`)
    }
    
  } catch (error) {
    console.error('Erro ao criar candidaturas teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestApplications()