const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testando login direto...');
    
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: 'admin@xpecial.com' }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Nome: ${user.name}`);
    console.log(`   🔑 Ativo: ${user.isActive}`);
    console.log(`   📬 Email verificado: ${user.isEmailVerified}`);
    console.log(`   🔐 Hash da senha: ${user.password ? 'Existe' : 'Não existe'}`);
    
    // Testar senha
    if (user.password) {
      const senhaCorreta = await bcrypt.compare('admin123', user.password);
      console.log(`   🔓 Senha 'admin123': ${senhaCorreta ? '✅ Correta' : '❌ Incorreta'}`);
      
      // Testar outras senhas possíveis
      const senhaAlternativa = await bcrypt.compare('123456', user.password);
      console.log(`   🔓 Senha '123456': ${senhaAlternativa ? '✅ Correta' : '❌ Incorreta'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();