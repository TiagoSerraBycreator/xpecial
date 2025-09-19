const fetch = require('node-fetch');

async function testNextAuthProviders() {
  try {
    console.log('🔍 Testando providers do NextAuth...');
    
    const response = await fetch('http://localhost:3000/api/auth/providers');
    const providers = await response.json();
    
    console.log('📊 Providers disponíveis:', JSON.stringify(providers, null, 2));
    
    if (providers.credentials) {
      console.log('✅ Provider credentials encontrado');
    } else {
      console.log('❌ Provider credentials NÃO encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar providers:', error);
  }
}

async function testNextAuthSession() {
  try {
    console.log('\n🔍 Testando sessão do NextAuth...');
    
    const response = await fetch('http://localhost:3000/api/auth/session');
    const session = await response.json();
    
    console.log('📊 Sessão atual:', JSON.stringify(session, null, 2));
    
  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error);
  }
}

async function testSignInPage() {
  try {
    console.log('\n🔍 Testando página de signin...');
    
    const response = await fetch('http://localhost:3000/api/auth/signin');
    console.log('📊 Status da página signin:', response.status);
    
    if (response.status === 200) {
      const text = await response.text();
      console.log('✅ Página de signin acessível');
      // Verificar se contém o provider credentials
      if (text.includes('credentials')) {
        console.log('✅ Provider credentials encontrado na página');
      } else {
        console.log('❌ Provider credentials NÃO encontrado na página');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao acessar signin:', error);
  }
}

async function runAllTests() {
  await testNextAuthProviders();
  await testNextAuthSession();
  await testSignInPage();
}

runAllTests();