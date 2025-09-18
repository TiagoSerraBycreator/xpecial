const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedInsightsData() {
  try {
    // Buscar usuários candidatos que não têm registro na tabela candidate
    const candidateUsers = await prisma.user.findMany({
      where: { 
        role: 'CANDIDATE',
        candidate: null
      }
    });

    console.log('Usuários candidatos sem registro:', candidateUsers.length);

    // Criar registros de candidatos
    for (const user of candidateUsers) {
      await prisma.candidate.create({
        data: {
          userId: user.id,
          description: `Desenvolvedor apaixonado por tecnologia`,
          skills: 'React, TypeScript, Node.js, Python',
          experience: 'JUNIOR',
          city: 'São Paulo',
          state: 'SP',
          phone: '(11) 99999-9999',
          aboutMe: `Sou ${user.name}, desenvolvedor com experiência em tecnologias modernas.`,
          education: 'Bacharelado em Ciência da Computação'
        }
      });
      console.log(`Registro de candidato criado para: ${user.name}`);
    }

    // Buscar usuários empresa que não têm registro na tabela company
    const companyUsers = await prisma.user.findMany({
      where: { 
        role: 'COMPANY',
        company: null
      }
    });

    console.log('Usuários empresa sem registro:', companyUsers.length);

    // Criar registros de empresas
    for (const user of companyUsers) {
      await prisma.company.create({
        data: {
          userId: user.id,
          name: user.name,
          slug: user.name.toLowerCase().replace(' ', '-'),
          email: user.email,
          description: `${user.name} é uma empresa líder em tecnologia`,
          website: `https://${user.name.toLowerCase().replace(' ', '-')}.com`,
          sector: 'Tecnologia',
          city: 'São Paulo',
          state: 'SP',
          phone: '(11) 3333-3333',
          employeeCount: '50-100',
          foundedYear: '2020'
        }
      });
      console.log(`Registro de empresa criado para: ${user.name}`);
    }

    // Agora buscar um candidato para criar dados de teste
    const candidate = await prisma.user.findFirst({
      where: { role: 'CANDIDATE' },
      include: { candidate: true }
    });

    if (!candidate || !candidate.candidate) {
      console.log('Ainda não há candidatos com registro');
      return;
    }

    console.log('Candidato encontrado:', candidate.name);

    // Buscar uma empresa
    const company = await prisma.user.findFirst({
      where: { role: 'COMPANY' },
      include: { company: true }
    });

    if (!company || !company.company) {
      console.log('Ainda não há empresas com registro');
      return;
    }

    console.log('Empresa encontrada:', company.name);

    // Criar algumas vagas
    const job1 = await prisma.job.create({
      data: {
        title: 'Desenvolvedor React',
        description: 'Vaga para desenvolvedor React experiente',
        requirements: 'React, TypeScript, Node.js',
        location: 'São Paulo, SP',
        salaryMin: 7000,
        salaryMax: 9000,
        type: 'FULL_TIME',
        status: 'APPROVED',
        companyId: company.company.id,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 dias atrás
      }
    });

    const job2 = await prisma.job.create({
      data: {
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack',
        requirements: 'React, Node.js, PostgreSQL',
        location: 'Rio de Janeiro, RJ',
        salaryMin: 8000,
        salaryMax: 10000,
        type: 'FULL_TIME',
        status: 'APPROVED',
        companyId: company.company.id,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 dias atrás
      }
    });

    const job3 = await prisma.job.create({
      data: {
        title: 'Desenvolvedor Backend',
        description: 'Vaga para desenvolvedor backend especialista',
        requirements: 'Node.js, PostgreSQL, Docker',
        location: 'Belo Horizonte, MG',
        salaryMin: 9000,
        salaryMax: 12000,
        type: 'FULL_TIME',
        status: 'APPROVED',
        companyId: company.company.id,
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 dias atrás
      }
    });

    // Criar candidaturas
    await prisma.application.create({
      data: {
        candidateId: candidate.candidate.id,
        jobId: job1.id,
        status: 'HIRED',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 dias atrás
        updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)  // 20 dias atrás
      }
    });

    await prisma.application.create({
      data: {
        candidateId: candidate.candidate.id,
        jobId: job2.id,
        status: 'INTERVIEW',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    });

    await prisma.application.create({
      data: {
        candidateId: candidate.candidate.id,
        jobId: job3.id,
        status: 'REJECTED',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)   // 8 dias atrás
      }
    });

    // Primeiro criar cursos
    const course1 = await prisma.course.create({
      data: {
        title: 'React Developer Certification',
        description: 'Curso completo de React para desenvolvedores',
        content: 'Conteúdo do curso de React',
        duration: 40
      }
    });

    const course2 = await prisma.course.create({
      data: {
        title: 'Node.js Professional',
        description: 'Curso avançado de Node.js',
        content: 'Conteúdo do curso de Node.js',
        duration: 60
      }
    });

    // Criar alguns certificados
    await prisma.certificate.create({
      data: {
        candidateId: candidate.candidate.id,
        courseId: course1.id,
        code: 'REACT-2024-001'
      }
    });

    await prisma.certificate.create({
      data: {
        candidateId: candidate.candidate.id,
        courseId: course2.id,
        code: 'NODEJS-2024-002'
      }
    });

    console.log('\nDados de teste criados com sucesso!');
    console.log('- 3 vagas criadas');
    console.log('- 3 candidaturas criadas (1 contratada, 1 em entrevista, 1 rejeitada)');
    console.log('- 2 certificados criados');

  } catch (error) {
    console.error('Erro ao criar dados de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedInsightsData();