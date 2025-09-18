import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestCompany() {
  try {
    console.log('Verificando se empresa de teste já existe...')
    
    // Verificar se já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'empresa@teste.com' },
      include: { company: true }
    })
    
    if (existingUser) {
      console.log('✅ Empresa de teste já existe!')
      console.log('📧 Email:', existingUser.email)
      console.log('🔑 Senha: 123456')
      console.log('🏢 Nome da empresa:', existingUser.company?.name)
      return
    }
    
    console.log('Criando empresa de teste...')
    
    const hashedPassword = await bcrypt.hash('123456', 10)
    
    // Criar usuário da empresa
    const user = await prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'empresa@teste.com',
        password: hashedPassword,
        role: 'COMPANY'
      }
    })
    
    // Criar perfil da empresa
    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: 'TechCorp Soluções',
        slug: 'techcorp-solucoes',
        email: 'contato@techcorp.com.br',
        description: 'Empresa de tecnologia focada em desenvolvimento de software e soluções digitais.',
        sector: 'Tecnologia',
        website: 'https://techcorp.com.br'
      }
    })
    
    console.log('✅ Empresa de teste criada com sucesso!')
    console.log('📧 Email:', user.email)
    console.log('🔑 Senha: 123456')
    console.log('🏢 Nome da empresa:', company.name)
    
  } catch (error) {
    console.error('Erro ao criar empresa teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestCompany()