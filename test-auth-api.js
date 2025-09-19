const fetch = require('node-fetch');

async function testAuthAPI() {
  try {
    console.log('🔍 Testando API de autenticação...');
    
    const response = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@xpecial.com',
        password: 'admin123',
        csrfToken: 'test', // Pode ser necessário obter o token real
        callbackUrl: 'http://localhost:3000',
        json: 'true'
      })
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Resposta:', responseText);
    
    if (response.status === 200) {
      console.log('✅ Autenticação bem-sucedida!');
    } else {
      console.log('❌ Falha na autenticação');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  }
}

// Também vamos testar o endpoint de signin
async function testSignInPage() {
  try {
    console.log('\n🔍 Testando página de signin...');
    
    const response = await fetch('http://localhost:3000/api/auth/signin');
    console.log('📊 Status da página signin:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Página de signin acessível');
    } else {
      console.log('❌ Problema com página de signin');
    }
    
  } catch (error) {
    console.error('❌ Erro ao acessar signin:', error);
  }
}

async function runTests() {
  await testSignInPage();
  await testAuthAPI();
}

runTests();