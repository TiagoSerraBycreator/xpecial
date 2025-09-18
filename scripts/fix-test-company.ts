import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixTestCompany() {
  try {
    console.log('Verificando e corrigindo empresa de teste...')
    
    // Buscar usuário da empresa
    const user = await prisma.user.findUnique({
      where: { email: 'empresa@teste.com' },
      include: { company: true }
    })
    
    if (!user) {
      console.log('❌ Usuário da empresa não encontrado!')
      return
    }
    
    if (user.company) {
      console.log('✅ Empresa já tem perfil:', user.company.name)
      return
    }
    
    // Criar perfil da empresa
    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: 'TechCorp Soluções',
        slug: 'techcorp-solucoes',
        email: user.email,
        description: 'Empresa de tecnologia focada em desenvolvimento de software e soluções digitais.',
        sector: 'Tecnologia',
        website: 'https://techcorp.com.br',
        isApproved: true
      }
    })
    
    console.log('✅ Perfil da empresa criado com sucesso!')
    console.log('🏢 Nome:', company.name)
    console.log('📧 Email:', user.email)
    console.log('🔑 Senha: 123456')
    
  } catch (error) {
    console.error('Erro ao corrigir empresa:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixTestCompany()