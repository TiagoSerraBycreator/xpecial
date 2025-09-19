const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase de produção
const supabaseUrl = 'https://fglvnmdjvsuqjicefddg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnbHZubWRqdnN1cWppY2VmZGRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTM2MzgsImV4cCI6MjA3Mzc4OTYzOH0.f8-cWNn5-xIYms5980dAQ3WBCfJsR8_iToynHHXv_ow';

async function checkAdminUser() {
  console.log('🔍 Verificando usuário admin no banco de produção...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Verificar se o usuário admin existe
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@admin.com');
    
    if (error) {
      console.error('❌ Erro ao consultar usuários:', error);
      return;
    }
    
    console.log('📊 Resultado da consulta:', users);
    
    if (users && users.length > 0) {
      console.log('✅ Usuário admin encontrado:', users[0]);
      console.log('📧 Email:', users[0].email);
      console.log('🆔 ID:', users[0].id);
      console.log('🔐 Senha hash:', users[0].password ? 'Presente' : 'Ausente');
      console.log('✅ Ativo:', users[0].isActive);
    } else {
      console.log('❌ Usuário admin NÃO encontrado no banco de produção!');
      console.log('🔧 Será necessário criar o usuário admin.');
    }
    
    // Verificar também na tabela auth.users do Supabase
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao consultar auth.users:', authError);
    } else {
      console.log('👥 Usuários na auth.users:', authUsers.users.length);
      const adminAuthUser = authUsers.users.find(u => u.email === 'admin@admin.com');
      if (adminAuthUser) {
        console.log('✅ Admin encontrado na auth.users:', adminAuthUser.id);
      } else {
        console.log('❌ Admin NÃO encontrado na auth.users');
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

checkAdminUser();