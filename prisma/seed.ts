import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Verificar se já existe um usuário administrador
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  })

  if (existingAdmin) {
    console.log('✅ Usuário administrador já existe:', existingAdmin.email)
    return
  }

  // Criar usuário administrador padrão
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@xpecial.com',
      password: hashedPassword,
      name: 'Administrador do Sistema',
      role: 'ADMIN'
    }
  })

  console.log('✅ Usuário administrador criado com sucesso!')
  console.log('📧 Email:', admin.email)
  console.log('🔑 Senha: admin123')
  console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })