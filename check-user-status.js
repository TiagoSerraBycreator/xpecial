const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'teste@exemplo.com' },
      select: {
        email: true,
        name: true,
        isEmailVerified: true,
        isActive: true,
        emailVerificationToken: true
      }
    });
    
    console.log('Status do usuário após verificação:');
    console.log(JSON.stringify(user, null, 2));
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();