const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCompanySlug() {
  try {
    console.log('=== VERIFICANDO SLUG DA EMPRESA ===')
    
    // Buscar empresa de teste
    const companyUser = await prisma.user.findUnique({
      where: { email: 'empresa@teste.com' },
      include: { company: true }
    })
    
    if (!companyUser || !companyUser.company) {
      console.log('❌ Empresa de teste não encontrada!')
      return
    }
    
    const company = companyUser.company
    console.log('✅ Empresa encontrada:')
    console.log(`   Nome: ${company.name}`)
    console.log(`   ID: ${company.id}`)
    console.log(`   Slug: ${company.slug || 'NÃO CONFIGURADO'}`)
    
    if (!company.slug) {
      console.log('\n🔧 Configurando slug para a empresa...')
      
      // Gerar slug baseado no nome
      const slug = company.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Atualizar empresa com slug
      const updatedCompany = await prisma.company.update({
        where: { id: company.id },
        data: { slug: slug }
      })
      
      console.log(`✅ Slug configurado: ${updatedCompany.slug}`)
      console.log(`🔗 URL do perfil público: http://localhost:3000/empresa/${updatedCompany.slug}`)
    } else {
      console.log(`🔗 URL do perfil público: http://localhost:3000/empresa/${company.slug}`)
    }
    
  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCompanySlug()