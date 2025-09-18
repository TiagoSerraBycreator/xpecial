const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: 'teste@exemplo.com' }
    });

    // Create new test user
    const user = await prisma.user.create({
      data: {
        email: 'teste@exemplo.com',
        password: 'senha123',
        name: 'Usuário Teste',
        role: 'CANDIDATE',
        isActive: false,
        isEmailVerified: false,
        emailVerificationToken: 'new-test-token-456',
        emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });

    console.log('Novo usuário de teste criado:');
    console.log(`Email: ${user.email}`);
    console.log(`Token: ${user.emailVerificationToken}`);
    console.log(`Link de teste: http://localhost:3000/ativar-conta?token=${user.emailVerificationToken}`);
    
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();