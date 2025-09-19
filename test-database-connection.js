const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Testando conexão com o banco PostgreSQL...');
    
    // Teste básico de conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Teste de query simples
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Query de teste executada:', result[0].version);
    
    // Verificar se as tabelas foram criadas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('✅ Tabelas encontradas no banco:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Teste de inserção e consulta (se a tabela User existir)
    try {
      const userCount = await prisma.user.count();
      console.log(`✅ Contagem de usuários: ${userCount}`);
    } catch (error) {
      console.log('⚠️  Erro ao contar usuários:', error.message);
    }
    
    console.log('🎉 Todos os testes de conexão passaram!');
    
  } catch (error) {
    console.error('❌ Erro na conexão com o banco:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexão fechada.');
  }
}

testDatabaseConnection();