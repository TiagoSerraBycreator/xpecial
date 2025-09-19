const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminPassword() {
    console.log('🔐 Testando senha do usuário admin...\n');
    
    try {
        // Buscar o usuário admin
        const user = await prisma.user.findUnique({
            where: { email: 'admin@admin.com' }
        });
        
        if (!user) {
            console.log('❌ Usuário admin não encontrado');
            return;
        }
        
        console.log('✅ Usuário encontrado:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive
        });
        
        // Testar diferentes senhas
        const passwordsToTest = ['admin123', 'admin', '123456', 'password'];
        
        for (const password of passwordsToTest) {
            console.log(`\n🔍 Testando senha: "${password}"`);
            
            try {
                const isValid = await bcrypt.compare(password, user.password);
                console.log(`📊 Resultado: ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
                
                if (isValid) {
                    console.log(`🎉 SENHA CORRETA ENCONTRADA: "${password}"`);
                    break;
                }
            } catch (error) {
                console.log(`❌ Erro ao testar senha "${password}":`, error.message);
            }
        }
        
        // Mostrar hash da senha para debug
        console.log(`\n🔐 Hash da senha no banco: ${user.password}`);
        
        // Testar criação de novo hash para comparação
        console.log('\n🔧 Testando criação de novo hash...');
        const newHash = await bcrypt.hash('admin123', 12);
        console.log(`🆕 Novo hash para "admin123": ${newHash}`);
        
        const testNewHash = await bcrypt.compare('admin123', newHash);
        console.log(`✅ Teste do novo hash: ${testNewHash ? 'VÁLIDO' : 'INVÁLIDO'}`);
        
    } catch (error) {
        console.error('💥 Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminPassword().catch(console.error);