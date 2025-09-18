const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function activateAdmin() {
  try {
    console.log('🔧 Ativando usuário administrador...');
    
    const updatedUser = await prisma.user.update({
      where: {
        email: 'admin@xpecial.com'
      },
      data: {
        isActive: true,
        isEmailVerified: true
      }
    });
    
    console.log('✅ Usuário administrador ativado com sucesso!');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 Nome: ${updatedUser.name}`);
    console.log(`🔑 Ativo: ${updatedUser.isActive}`);
    console.log(`📬 Email verificado: ${updatedUser.isEmailVerified}`);
    
  } catch (error) {
    console.error('❌ Erro ao ativar administrador:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

activateAdmin();