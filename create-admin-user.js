const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('👤 Criando usuário administrador de teste...\n');
    
    // Dados do usuário admin
    const adminData = {
      email: 'admin@xpecial.com',
      password: 'admin123',
      name: 'Administrador Xpecial',
      role: 'ADMIN'
    };
    
    // Verificar se já existe um usuário com este email
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    });
    
    if (existingUser) {
      console.log('⚠️  Usuário admin já existe!');
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Nome: ${existingUser.name}`);
      console.log(`🔑 Role: ${existingUser.role}`);
      console.log(`✅ Ativo: ${existingUser.isActive ? 'Sim' : 'Não'}`);
      console.log(`📧 Email verificado: ${existingUser.isEmailVerified ? 'Sim' : 'Não'}`);
      return;
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminData.password, 12);
    
    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        name: adminData.name,
        role: adminData.role,
        isActive: true,
        isEmailVerified: true
      }
    });
    
    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('=' .repeat(50));
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Senha: ${adminData.password}`);
    console.log(`👤 Nome: ${adminUser.name}`);
    console.log(`🎯 Role: ${adminUser.role}`);
    console.log(`🆔 ID: ${adminUser.id}`);
    console.log(`✅ Ativo: ${adminUser.isActive ? 'Sim' : 'Não'}`);
    console.log(`📧 Email verificado: ${adminUser.isEmailVerified ? 'Sim' : 'Não'}`);
    console.log('=' .repeat(50));
    
    // Criar alguns usuários de teste adicionais
    console.log('\n👥 Criando usuários de teste adicionais...');
    
    // Usuário empresa
    const companyPassword = await bcrypt.hash('empresa123', 12);
    const companyUser = await prisma.user.create({
      data: {
        email: 'empresa@teste.com',
        password: companyPassword,
        name: 'Empresa Teste',
        role: 'COMPANY',
        isActive: true,
        isEmailVerified: true
      }
    });
    
    // Criar perfil da empresa
    const company = await prisma.company.create({
      data: {
        userId: companyUser.id,
        name: "Empresa Teste Ltda",
        slug: "empresa-teste",
        email: "contato@empresa-teste.com",
        description: "Uma empresa de teste para demonstração",
        website: "https://empresa-teste.com",
        sector: "Tecnologia",
        city: "São Paulo",
        state: "SP",
        isApproved: true,
      }
    });
    
    console.log(`✅ Empresa criada: ${company.name} (${companyUser.email})`);
    
    // Usuário candidato
    const candidatePassword = await bcrypt.hash('candidato123', 12);
    const candidateUser = await prisma.user.create({
      data: {
        email: 'candidato@teste.com',
        password: candidatePassword,
        name: 'João Silva',
        role: 'CANDIDATE',
        isActive: true,
        isEmailVerified: true
      }
    });
    
    // Criar perfil do candidato
    const candidate = await prisma.candidate.create({
      data: {
        userId: candidateUser.id,
        phone: '(11) 99999-9999',
        city: 'São Paulo',
        state: 'SP',
        skills: 'JavaScript, React, Node.js, PostgreSQL',
        languages: 'Português (Nativo), Inglês (Avançado)',
        availability: 'Imediato',
        description: 'Desenvolvedor Full Stack com 3 anos de experiência',
        aboutMe: 'Apaixonado por tecnologia e sempre em busca de novos desafios',
        experience: 'Desenvolvedor Full Stack na TechCorp (2021-2024)',
        education: 'Bacharelado em Ciência da Computação - USP'
      }
    });
    
    console.log(`✅ Candidato criado: ${candidate.userId} (${candidateUser.email})`);
    
    // Criar uma vaga de teste
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: 'Desenvolvedor Full Stack',
        description: 'Vaga para desenvolvedor full stack com experiência em React e Node.js',
        requirements: 'Experiência com JavaScript, React, Node.js, PostgreSQL',
        benefits: 'Vale refeição, plano de saúde, home office',
        salary: 'R$ 8.000 - R$ 12.000',
        location: 'São Paulo, SP',
        type: 'CLT',
        level: 'Pleno',
        isActive: true
      }
    });
    
    console.log(`✅ Vaga criada: ${job.title}`);
    
    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log('\n📋 RESUMO DOS USUÁRIOS CRIADOS:');
    console.log('=' .repeat(60));
    console.log('👑 ADMIN:');
    console.log(`   📧 Email: admin@xpecial.com`);
    console.log(`   🔑 Senha: admin123`);
    console.log('');
    console.log('🏢 EMPRESA:');
    console.log(`   📧 Email: empresa@teste.com`);
    console.log(`   🔑 Senha: empresa123`);
    console.log('');
    console.log('👤 CANDIDATO:');
    console.log(`   📧 Email: candidato@teste.com`);
    console.log(`   🔑 Senha: candidato123`);
    console.log('=' .repeat(60));
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();