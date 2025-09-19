const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Verificando dados no banco PostgreSQL...\n');
    
    // Verificar usuários
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isEmailVerified: true
      }
    });
    
    console.log('👥 USUÁRIOS:');
    if (users.length === 0) {
      console.log('   Nenhum usuário encontrado');
    } else {
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
        console.log(`     Role: ${user.role}, Ativo: ${user.isActive}, Email verificado: ${user.isEmailVerified}`);
      });
    }
    
    // Verificar empresas
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
    
    console.log('\n🏢 EMPRESAS:');
    if (companies.length === 0) {
      console.log('   Nenhuma empresa encontrada');
    } else {
      companies.forEach(company => {
        console.log(`   - ${company.name} (${company.slug})`);
      });
    }
    
    // Verificar candidatos
    const candidates = await prisma.candidate.findMany({
      select: {
        id: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('\n👤 CANDIDATOS:');
    if (candidates.length === 0) {
      console.log('   Nenhum candidato encontrado');
    } else {
      candidates.forEach(candidate => {
        console.log(`   - ${candidate.user.name} (${candidate.user.email})`);
      });
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();