const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Simular exatamente a função authorize do NextAuth
async function simulateAuthorize(credentials) {
    console.log('🚀 AUTHORIZE FUNCTION CALLED!')
    console.log('🔍 Credentials received:', credentials ? { email: credentials.email, hasPassword: !!credentials.password } : 'null')
    
    try {
        console.log('🔍 Verificando instância do Prisma:', !!prisma)
        
        if (!credentials?.email || !credentials?.password) {
            console.log('❌ Credenciais inválidas ou ausentes')
            return null
        }

        console.log('🔍 Iniciando busca pelo usuário:', credentials.email)
        
        const user = await prisma.user.findUnique({
            where: { email: credentials.email }
        })

        console.log('🔍 Resultado da busca:', !!user)
        console.log('🔍 Detalhes do usuário:', user ? { id: user.id, email: user.email, role: user.role, isActive: user.isActive } : 'null')

        if (!user || !user.isActive) {
            console.log('❌ Usuário não encontrado ou inativo')
            return null
        }

        console.log('🔍 Verificando senha...')
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
        console.log('🔍 Senha válida:', isPasswordValid)

        if (!isPasswordValid) {
            console.log('❌ Senha inválida')
            return null
        }

        console.log('✅ Login bem-sucedido!')
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }
    } catch (error) {
        console.error('💥 Erro na função authorize:', error)
        return null
    }
}

async function testAuthorizeFunction() {
    console.log('🧪 Testando função authorize do NextAuth...\n');
    
    // Teste 1: Credenciais corretas
    console.log('📋 TESTE 1: Credenciais corretas');
    const result1 = await simulateAuthorize({
        email: 'admin@admin.com',
        password: 'admin123'
    });
    console.log('📊 Resultado:', result1);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 2: Email incorreto
    console.log('📋 TESTE 2: Email incorreto');
    const result2 = await simulateAuthorize({
        email: 'admin@xpecial.com',
        password: 'admin123'
    });
    console.log('📊 Resultado:', result2);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 3: Senha incorreta
    console.log('📋 TESTE 3: Senha incorreta');
    const result3 = await simulateAuthorize({
        email: 'admin@admin.com',
        password: 'senhaerrada'
    });
    console.log('📊 Resultado:', result3);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 4: Credenciais vazias
    console.log('📋 TESTE 4: Credenciais vazias');
    const result4 = await simulateAuthorize({});
    console.log('📊 Resultado:', result4);
    
    await prisma.$disconnect();
    
    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('1. Credenciais corretas:', result1 ? '✅ SUCESSO' : '❌ FALHOU');
    console.log('2. Email incorreto:', result2 ? '❌ INESPERADO' : '✅ FALHOU COMO ESPERADO');
    console.log('3. Senha incorreta:', result3 ? '❌ INESPERADO' : '✅ FALHOU COMO ESPERADO');
    console.log('4. Credenciais vazias:', result4 ? '❌ INESPERADO' : '✅ FALHOU COMO ESPERADO');
    
    if (result1) {
        console.log('\n🎉 A função authorize está funcionando corretamente!');
        console.log('🔍 O problema pode estar em:');
        console.log('   - Configuração do NEXTAUTH_SECRET');
        console.log('   - Configuração do NEXTAUTH_URL');
        console.log('   - Middleware interferindo');
        console.log('   - Configuração de CORS');
    } else {
        console.log('\n❌ A função authorize não está funcionando!');
        console.log('🔍 Verifique:');
        console.log('   - Conexão com banco de dados');
        console.log('   - Configuração do Prisma');
        console.log('   - Hash da senha');
    }
}

testAuthorizeFunction().catch(console.error);