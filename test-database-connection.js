const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...\n');

  const prisma = new PrismaClient();

  try {
    // Teste básico de conexão
    console.log('1. 🔌 Testando conexão básica...');
    await prisma.$connect();
    console.log('   ✅ Conexão estabelecida com sucesso!');

    // Teste de query simples
    console.log('\n2. 📊 Testando query simples...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Total de usuários: ${userCount}`);

    // Teste específico para NextAuth
    console.log('\n3. 🔐 Testando tabelas do NextAuth...');
    
    try {
      const sessionCount = await prisma.session.count();
      console.log(`   ✅ Tabela Session: ${sessionCount} registros`);
    } catch (error) {
      console.log(`   ❌ Erro na tabela Session: ${error.message}`);
    }

    try {
      const accountCount = await prisma.account.count();
      console.log(`   ✅ Tabela Account: ${accountCount} registros`);
    } catch (error) {
      console.log(`   ❌ Erro na tabela Account: ${error.message}`);
    }

    try {
      const verificationTokenCount = await prisma.verificationToken.count();
      console.log(`   ✅ Tabela VerificationToken: ${verificationTokenCount} registros`);
    } catch (error) {
      console.log(`   ❌ Erro na tabela VerificationToken: ${error.message}`);
    }

    console.log('\n4. 🏗️ Verificando schema do banco...');
    
    // Verificar se as tabelas necessárias para o NextAuth existem
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name IN ('Account', 'Session', 'User', 'VerificationToken')
      ORDER BY name;
    `;
    
    console.log('   📋 Tabelas do NextAuth encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });

    if (tables.length < 4) {
      console.log('\n   ⚠️  PROBLEMA: Algumas tabelas do NextAuth estão faltando!');
      console.log('   💡 Execute: npx prisma db push');
    }

  } catch (error) {
    console.log(`❌ Erro na conexão: ${error.message}`);
    
    if (error.code === 'P1001') {
      console.log('💡 Banco de dados não acessível - verifique DATABASE_URL');
    } else if (error.code === 'P2021') {
      console.log('💡 Tabela não existe - execute as migrações');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n🎯 RESULTADO:');
  console.log('✅ Conexão com banco de dados está funcionando!');
  return true;
}

testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n💡 Se o banco está OK, o erro 500 pode ser:');
      console.log('1. 🔧 Problema na configuração do PrismaAdapter');
      console.log('2. 🐛 Bug no código do NextAuth');
      console.log('3. 🔄 Cache do Next.js corrompido');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });