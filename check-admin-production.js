const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

// Script para verificar e criar usuário admin no banco de produção
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

async function checkAndCreateAdminProduction() {
  try {
    console.log('🔍 Verificando usuário admin no banco de produção...\n')
    
    // Verificar conexão
    console.log('🔗 Testando conexão com o banco...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso!')

    // Listar todos os usuários
    console.log('\n📋 Usuários existentes no banco:')
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Total: ${allUsers.length} usuários`)
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - Ativo: ${user.isActive}`)
    })

    // Verificar se admin@xpecial.com já existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@xpecial.com' }
    })

    if (existingAdmin) {
      console.log('\n✅ Usuário admin@xpecial.com já existe!')
      console.log(`📧 Email: ${existingAdmin.email}`)
      console.log(`👤 Nome: ${existingAdmin.name}`)
      console.log(`🔑 Role: ${existingAdmin.role}`)
      console.log(`✅ Ativo: ${existingAdmin.isActive ? 'Sim' : 'Não'}`)
      console.log(`📧 Email verificado: ${existingAdmin.isEmailVerified ? 'Sim' : 'Não'}`)
      
      if (!existingAdmin.isActive) {
        console.log('\n⚠️  Usuário existe mas está inativo. Ativando...')
        await prisma.user.update({
          where: { email: 'admin@xpecial.com' },
          data: { 
            isActive: true,
            isEmailVerified: true 
          }
        })
        console.log('✅ Usuário ativado com sucesso!')
      }
      
      return
    }

    // Criar usuário admin se não existir
    console.log('\n👤 Usuário admin não encontrado. Criando...')
    
    // Hash da senha
    console.log('🔐 Gerando hash da senha...')
    const hashedPassword = await bcrypt.hash('admin123', 12)

    // Criar usuário admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@xpecial.com',
        password: hashedPassword,
        name: 'Administrador Xpecial',
        role: 'ADMIN',
        isActive: true,
        isEmailVerified: true
      }
    })

    console.log('\n✅ Usuário administrador criado com sucesso!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Nome: ${admin.name}`)
    console.log(`🔑 Role: ${admin.role}`)
    console.log(`🆔 ID: ${admin.id}`)
    console.log(`🔐 Senha: admin123`)

    console.log('\n🎉 Pronto! Agora você pode fazer login com:')
    console.log('   Email: admin@xpecial.com')
    console.log('   Senha: admin123')

  } catch (error) {
    console.error('💥 Erro:', error)
    
    if (error.code === 'P1001') {
      console.error('\n❌ Erro de conexão com o banco de dados.')
      console.error('Verifique se as variáveis de ambiente estão configuradas corretamente.')
    } else if (error.code === 'P2002') {
      console.error('\n❌ Usuário já existe no banco.')
    } else {
      console.error('\n❌ Erro desconhecido:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  checkAndCreateAdminProduction()
}

module.exports = { checkAndCreateAdminProduction }