const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Usar a mesma URL de produção
const DATABASE_URL = 'postgresql://postgres:Desiree2205%2E01@db.fglvnmdjvsuqjicefddg.supabase.co:5432/postgres?schema=public';

async function testPrismaProduction() {
  console.log('🔍 Testando conexão Prisma em produção...');
  console.log('🔗 DATABASE_URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));
  
  let prisma;
  
  try {
    // Criar instância do Prisma
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL
        }
      },
      log: ['query', 'info', 'warn', 'error']
    });
    
    console.log('✅ Instância do Prisma criada');
    
    // Testar conexão
    console.log('\n1️⃣ Testando conexão...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida');
    
    // Simular exatamente o que acontece na função authorize
    console.log('\n2️⃣ Simulando função authorize...');
    const credentials = {
      email: 'admin@admin.com',
      password: 'admin123'
    };
    
    console.log('🔍 Credenciais:', { email: credentials.email, hasPassword: !!credentials.password });
    
    if (!credentials?.email || !credentials?.password) {
      console.log('❌ Credenciais inválidas ou ausentes');
      return;
    }
    
    console.log('🔍 Iniciando busca pelo usuário:', credentials.email);
    
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });
    
    console.log('🔍 Resultado da busca:', !!user);
    console.log('🔍 Detalhes do usuário:', user ? { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      isActive: user.isActive,
      hasPassword: !!user.password 
    } : 'null');
    
    if (!user || !user.isActive) {
      console.log('❌ Usuário não encontrado ou inativo');
      return;
    }
    
    console.log('🔍 Verificando senha...');
    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    console.log('🔍 Senha válida:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Senha inválida');
      return;
    }
    
    console.log('✅ Login bem-sucedido!');
    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    console.log('📤 Resultado retornado:', result);
    
  } catch (error) {
    console.error('💥 Erro:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('🔌 Conexão fechada');
    }
  }
}

testPrismaProduction();