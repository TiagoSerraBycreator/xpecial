const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testAuthQuery() {
  try {
    console.log('🔍 Testando consulta exata da autenticação...');
    
    // Esta é a consulta exata que está sendo usada no auth.ts
    const user = await prisma.user.findUnique({
      where: {
        email: 'admin@xpecial.com'
      },
      include: {
        candidate: true,
        company: true
      }
    });
    
    console.log('📊 Resultado da consulta:');
    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Nome: ${user.name}`);
      console.log(`   🔑 ID: ${user.id}`);
      console.log(`   🔐 Role: ${user.role}`);
      console.log(`   ✅ Ativo: ${user.isActive}`);
      console.log(`   📬 Email verificado: ${user.isEmailVerified}`);
      console.log(`   👤 Candidato: ${user.candidate ? 'Sim' : 'Não'}`);
      console.log(`   🏢 Empresa: ${user.company ? 'Sim' : 'Não'}`);
    } else {
      console.log('❌ Usuário NÃO encontrado!');
    }
    
    // Vamos também testar uma consulta mais simples
    console.log('\n🔍 Testando consulta simples...');
    const simpleUser = await prisma.user.findUnique({
      where: {
        email: 'admin@xpecial.com'
      }
    });
    
    if (simpleUser) {
      console.log('✅ Consulta simples: Usuário encontrado');
    } else {
      console.log('❌ Consulta simples: Usuário NÃO encontrado');
    }
    
    // Vamos listar todos os usuários para verificar
    console.log('\n📋 Listando todos os usuários:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        isEmailVerified: true
      }
    });
    
    console.log(`📊 Total de usuários: ${allUsers.length}`);
    allUsers.forEach((u, index) => {
      console.log(`   ${index + 1}. ${u.email} (${u.name}) - Ativo: ${u.isActive}, Verificado: ${u.isEmailVerified}`);
    });
    
  } catch (error) {
    console.error('❌ Erro na consulta:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthQuery();