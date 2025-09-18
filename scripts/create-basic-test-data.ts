import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createBasicTestData() {
  try {
    console.log('🚀 Criando dados básicos de teste...')

    // 1. Criar usuário empresa
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    const companyUser = await prisma.user.create({
      data: {
        name: 'Tech Solutions Ltda',
        email: 'empresa@teste.com',
        password: hashedPassword,
        role: 'COMPANY'
      }
    })

    console.log('✅ Usuário empresa criado:', companyUser.email)

    // 2. Criar perfil da empresa
    const company = await prisma.company.create({
      data: {
        userId: companyUser.id,
        name: 'Tech Solutions Ltda',
        slug: 'tech-solutions',
        email: 'empresa@teste.com',
        sector: 'Tecnologia',
        description: 'Empresa de desenvolvimento de software',
        website: 'https://techsolutions.com',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        foundedYear: '2020',
        employeeCount: '50-100',
        mission: 'Transformar ideias em soluções tecnológicas',
        vision: 'Ser referência em inovação tecnológica',
        values: 'Inovação, Qualidade, Transparência',
        isApproved: true
      }
    })

    console.log('✅ Empresa criada:', company.name)

    // 3. Criar algumas vagas
    const jobs = await Promise.all([
      prisma.job.create({
        data: {
          companyId: company.id,
          title: 'Desenvolvedor Frontend React',
          description: 'Desenvolvedor experiente em React, TypeScript e Next.js',
          requirements: 'Experiência com React, TypeScript, Next.js, Tailwind CSS',
          location: 'São Paulo, SP',
          workMode: 'HIBRIDO',
          salaryMin: 8000,
          salaryMax: 12000,
          city: 'São Paulo',
          state: 'SP',
          sector: 'Tecnologia',
          status: 'APPROVED',
          isActive: true
        }
      }),
      prisma.job.create({
        data: {
          companyId: company.id,
          title: 'Desenvolvedor Backend Node.js',
          description: 'Desenvolvedor backend com experiência em Node.js e bancos de dados',
          requirements: 'Node.js, Express, PostgreSQL, MongoDB, APIs REST',
          location: 'São Paulo, SP',
          workMode: 'REMOTO',
          salaryMin: 9000,
          salaryMax: 14000,
          city: 'São Paulo',
          state: 'SP',
          sector: 'Tecnologia',
          status: 'APPROVED',
          isActive: true
        }
      }),
      prisma.job.create({
        data: {
          companyId: company.id,
          title: 'Designer UX/UI',
          description: 'Designer com experiência em interfaces web e mobile',
          requirements: 'Figma, Adobe XD, Sketch, prototipagem, design thinking',
          location: 'São Paulo, SP',
          workMode: 'PRESENCIAL',
          salaryMin: 6000,
          salaryMax: 10000,
          city: 'São Paulo',
          state: 'SP',
          sector: 'Design',
          status: 'APPROVED',
          isActive: true
        }
      })
    ])

    console.log(`✅ ${jobs.length} vagas criadas`)

    // 4. Criar alguns candidatos
    const candidates = await Promise.all([
      // Candidato 1
      prisma.user.create({
        data: {
          name: 'João Silva',
          email: 'joao@teste.com',
          password: hashedPassword,
          role: 'CANDIDATE',
          candidate: {
            create: {
              phone: '(11) 98888-8888',
              city: 'São Paulo',
              state: 'SP',
              skills: 'React, TypeScript, JavaScript, HTML, CSS',
              experience: '3 anos de experiência em desenvolvimento frontend',
              education: 'Bacharelado em Ciência da Computação',
              description: 'Desenvolvedor frontend apaixonado por tecnologia'
            }
          }
        },
        include: { candidate: true }
      }),
      // Candidato 2
      prisma.user.create({
        data: {
          name: 'Maria Santos',
          email: 'maria@teste.com',
          password: hashedPassword,
          role: 'CANDIDATE',
          candidate: {
            create: {
              phone: '(11) 97777-7777',
              city: 'Rio de Janeiro',
              state: 'RJ',
              skills: 'Node.js, Express, PostgreSQL, MongoDB',
              experience: '5 anos de experiência em desenvolvimento backend',
              education: 'Bacharelado em Engenharia de Software',
              description: 'Desenvolvedora backend com foco em performance'
            }
          }
        },
        include: { candidate: true }
      }),
      // Candidato 3
      prisma.user.create({
        data: {
          name: 'Pedro Costa',
          email: 'pedro@teste.com',
          password: hashedPassword,
          role: 'CANDIDATE',
          candidate: {
            create: {
              phone: '(11) 96666-6666',
              city: 'Belo Horizonte',
              state: 'MG',
              skills: 'Figma, Adobe XD, Sketch, Photoshop',
              experience: '4 anos de experiência em design UX/UI',
              education: 'Bacharelado em Design Gráfico',
              description: 'Designer focado em experiência do usuário'
            }
          }
        },
        include: { candidate: true }
      })
    ])

    console.log(`✅ ${candidates.length} candidatos criados`)

    // 5. Criar candidaturas
    const applications = await Promise.all([
      // João se candidata para Frontend
      prisma.application.create({
        data: {
          candidateId: candidates[0].candidate!.id,
          jobId: jobs[0].id,
          message: 'Tenho experiência sólida em React e TypeScript, adoraria fazer parte da equipe!',
          whatsapp: '11988888888',
          consent: true,
          status: 'APPLIED'
        }
      }),
      // Maria se candidata para Backend
      prisma.application.create({
        data: {
          candidateId: candidates[1].candidate!.id,
          jobId: jobs[1].id,
          message: 'Minha experiência em Node.js e bancos de dados seria muito útil para o projeto.',
          whatsapp: '11977777777',
          consent: true,
          status: 'SCREENING'
        }
      }),
      // Pedro se candidata para Designer
      prisma.application.create({
        data: {
          candidateId: candidates[2].candidate!.id,
          jobId: jobs[2].id,
          message: 'Tenho um portfólio sólido em UX/UI e experiência com as ferramentas mencionadas.',
          whatsapp: '11966666666',
          consent: true,
          status: 'INTERVIEW'
        }
      }),
      // João também se candidata para Backend
      prisma.application.create({
        data: {
          candidateId: candidates[0].candidate!.id,
          jobId: jobs[1].id,
          message: 'Embora meu foco seja frontend, tenho conhecimento em backend também.',
          whatsapp: '11988888888',
          consent: true,
          status: 'APPLIED'
        }
      })
    ])

    console.log(`✅ ${applications.length} candidaturas criadas`)

    console.log('\n🎉 Dados básicos de teste criados com sucesso!')
    console.log('\n📋 Resumo:')
    console.log(`👤 Empresa: ${company.name} (${companyUser.email})`)
    console.log(`💼 Vagas: ${jobs.length}`)
    console.log(`👥 Candidatos: ${candidates.length}`)
    console.log(`📝 Candidaturas: ${applications.length}`)
    console.log('\n🔑 Credenciais de teste:')
    console.log('Empresa: empresa@teste.com / 123456')
    console.log('Candidatos: joao@teste.com, maria@teste.com, pedro@teste.com / 123456')

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createBasicTestData()