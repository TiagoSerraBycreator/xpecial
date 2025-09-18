const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { emailVerificationToken: { not: null } },
          { isEmailVerified: false }
        ]
      },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: true,
        emailVerificationExpiry: true
      }
    });
    
    console.log('Usuários com tokens de verificação ou não verificados:');
    console.log(JSON.stringify(users, null, 2));
    
    if (users.length === 0) {
      console.log('\nNenhum usuário encontrado. Vamos criar um usuário de teste...');
      
      const testUser = await prisma.user.create({
        data: {
          email: 'teste@exemplo.com',
          name: 'Usuário Teste',
          password: 'senha123',
          role: 'CANDIDATE',
          isEmailVerified: false,
          isActive: false,
          emailVerificationToken: 'test-token-123',
          emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
        }
      });
      
      console.log('\nUsuário de teste criado:');
      console.log(JSON.stringify(testUser, null, 2));
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();