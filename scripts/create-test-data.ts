import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestData() {
  try {
    console.log('Criando dados de teste para o dashboard da empresa...')
    
    // Buscar a empresa de teste
    const companyUser = await prisma.user.findUnique({
      where: { email: 'empresa@teste.com' },
      include: { company: true }
    })
    
    if (!companyUser || !companyUser.company) {
      console.log('❌ Empresa de teste não encontrada!')
      return
    }
    
    const company = companyUser.company
    console.log('✅ Empresa encontrada:', company.name)
    
    // Criar algumas vagas de teste
    const jobs = [
      {
        title: 'Desenvolvedor Frontend React',
        description: 'Vaga para desenvolvedor frontend com experiência em React, TypeScript e Next.js.',
        requirements: 'React, TypeScript, Next.js, 2+ anos de experiência',
        location: 'São Paulo, SP',
        workMode: 'HIBRIDO' as const,
        salaryMin: 5000,
        salaryMax: 8000,
        city: 'São Paulo',
        state: 'SP',
        status: 'APPROVED' as const,
        isActive: true
      },
      {
        title: 'Desenvolvedor Backend Node.js',
        description: 'Desenvolvedor backend para APIs REST com Node.js, Express e MongoDB.',
        requirements: 'Node.js, Express, MongoDB, APIs REST, 3+ anos',
        location: 'São Paulo, SP',
        workMode: 'REMOTO' as const,
        salaryMin: 6000,
        salaryMax: 10000,
        city: 'São Paulo',
        state: 'SP',
        status: 'APPROVED' as const,
        isActive: true
      },
      {
        title: 'Designer UX/UI',
        description: 'Designer para criação de interfaces e experiências digitais.',
        requirements: 'Figma, Adobe XD, Prototipagem, 2+ anos',
        location: 'São Paulo, SP',
        workMode: 'PRESENCIAL' as const,
        salaryMin: 4000,
        salaryMax: 7000,
        city: 'São Paulo',
        state: 'SP',
        status: 'APPROVED' as const,
        isActive: true
      }
    ]
    
    console.log('Criando vagas...')
    const createdJobs = []
    
    for (const jobData of jobs) {
      const job = await prisma.job.create({
        data: {
          ...jobData,
          companyId: company.id
        }
      })
      createdJobs.push(job)
      console.log(`✓ Vaga criada: ${job.title}`)
    }
    
    // Buscar candidatos de teste
    const candidates = await prisma.candidate.findMany({
      where: {
        user: {
          email: {
            endsWith: '@teste.com'
          }
        }
      },
      include: {
        user: true
      },
      take: 6
    })
    
    console.log(`\nCriando candidaturas com ${candidates.length} candidatos...`)
    
    // Criar candidaturas para cada vaga
    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'PARTICIPATING']
    let applicationCount = 0
    
    for (const job of createdJobs) {
      // Cada vaga terá entre 2-4 candidaturas
      const numApplications = Math.floor(Math.random() * 3) + 2
      const selectedCandidates = candidates.slice(0, numApplications)
      
      for (let i = 0; i < selectedCandidates.length; i++) {
        const candidate = selectedCandidates[i]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        
        try {
          await prisma.application.create({
            data: {
              candidateId: candidate.id,
              jobId: job.id,
              status: status as any,
              message: `Tenho grande interesse nesta vaga de ${job.title}. Acredito que minha experiência pode contribuir significativamente para a equipe.`
            }
          })
          applicationCount++
          console.log(`✓ Candidatura criada: ${candidate.user.name} -> ${job.title} (${status})`)
        } catch (error) {
          // Candidatura já existe, pular
          console.log(`⚠ Candidatura já existe: ${candidate.user.name} -> ${job.title}`)
        }
      }
    }
    
    console.log(`\n✅ Dados de teste criados com sucesso!`)
    console.log(`📊 Resumo:`)
    console.log(`   - ${createdJobs.length} vagas criadas`)
    console.log(`   - ${applicationCount} candidaturas criadas`)
    console.log(`\n🔗 Acesse: http://localhost:3000/login`)
    console.log(`📧 Email: empresa@teste.com`)
    console.log(`🔑 Senha: 123456`)
    
  } catch (error) {
    console.error('Erro ao criar dados de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestData()