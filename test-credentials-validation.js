const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configurações do Supabase de produção
const supabaseUrl = 'https://fglvnmdjvsuqjicefddg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbHZubWRqdnN1cWppY2VmZGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTM2MzgsImV4cCI6MjA3Mzc4OTYzOH0.f8-cWNn5-xIYms5980dAQ3WBCfJsR8_iToynHHXv_ow';

async function testCredentialsValidation() {
  console.log('🔍 Testando validação de credenciais...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Buscar o usuário admin
    console.log('\n1️⃣ Buscando usuário admin...');
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@admin.com');
    
    if (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ Usuário admin não encontrado!');
      return;
    }
    
    const user = users[0];
    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      hasPassword: !!user.password
    });
    
    // 2. Testar validação da senha
    console.log('\n2️⃣ Testando validação da senha...');
    const testPassword = 'admin123';
    console.log('🔐 Senha de teste:', testPassword);
    console.log('🔐 Hash armazenado:', user.password);
    
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    console.log('✅ Senha válida:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ A senha não confere! Vamos testar outras possibilidades...');
      
      // Testar outras senhas possíveis
      const possiblePasswords = ['admin', 'Admin123', 'admin@123', '123456'];
      for (const pwd of possiblePasswords) {
        const isValid = await bcrypt.compare(pwd, user.password);
        console.log(`🔍 Testando '${pwd}':`, isValid);
        if (isValid) {
          console.log(`✅ Senha correta encontrada: ${pwd}`);
          break;
        }
      }
    }
    
    // 3. Verificar se o usuário está ativo
    console.log('\n3️⃣ Verificando status do usuário...');
    console.log('🟢 Usuário ativo:', user.isActive);
    console.log('📧 Email verificado:', user.isEmailVerified);
    
    // 4. Gerar um novo hash para comparação
    console.log('\n4️⃣ Gerando novo hash para comparação...');
    const newHash = await bcrypt.hash('admin123', 12);
    console.log('🔐 Novo hash gerado:', newHash);
    
    const testNewHash = await bcrypt.compare('admin123', newHash);
    console.log('✅ Teste do novo hash:', testNewHash);
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testCredentialsValidation();