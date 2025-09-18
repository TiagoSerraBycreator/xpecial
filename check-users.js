const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    // Buscar usuários do tipo COMPANY
    const companyUsers = await prisma.user.findMany({
      where: {
        role: 'COMPANY'
      },
      include: {
        company: true
      }
    })

    console.log('=== USUÁRIOS EMPRESA ===')
    if (companyUsers.length > 0) {
      companyUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Empresa: ${user.company?.name || 'Não encontrada'}`)
        console.log('')
      })
    } else {
      console.log('Nenhum usuário empresa encontrado')
    }
    
  } catch (error) {
    console.error('Erro ao verificar usuários:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()