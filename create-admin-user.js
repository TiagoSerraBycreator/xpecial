const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminEmail = 'tiagoss@gmail.com';
    const adminPassword = 'Admin@2025!'; // Senha segura gerada
    
    // Verificar se o usuário admin já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      console.log('❌ Usuário admin já existe com este email:', adminEmail);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador',
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
      }
    });

    console.log('✅ Conta de admin criada com sucesso!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Senha:', adminPassword);
    console.log('👤 Nome:', adminUser.name);
    console.log('🛡️ Role:', adminUser.role);
    console.log('✅ Status:', adminUser.isActive ? 'Ativo' : 'Inativo');
    console.log('📧 Email verificado:', adminUser.isEmailVerified ? 'Sim' : 'Não');
    console.log('');
    console.log('🌐 Acesse: http://localhost:3000/login');
    console.log('');
    console.log('⚠️ IMPORTANTE: Guarde essas credenciais em local seguro!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();