const fetch = require('node-fetch');

async function testDirectAuth() {
  try {
    console.log('🔍 Testando autenticação direta...');
    
    // 1. Obter CSRF token
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf');
    const csrfData = await csrfResponse.json();
    console.log('✅ CSRF token obtido:', csrfData.csrfToken);
    
    // 2. Fazer login usando o mesmo formato que o frontend usa
    const loginData = new URLSearchParams({
      email: 'admin@xpecial.com',
      password: 'admin123',
      csrfToken: csrfData.csrfToken,
      callbackUrl: 'http://localhost:3000/dashboard',
      json: 'true'
    });
    
    console.log('📤 Enviando dados de login:', {
      email: 'admin@xpecial.com',
      password: '[HIDDEN]',
      csrfToken: csrfData.csrfToken.substring(0, 10) + '...',
      callbackUrl: 'http://localhost:3000/dashboard'
    });
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': `next-auth.csrf-token=${csrfData.csrfToken}`
      },
      body: loginData.toString(),
      redirect: 'manual'
    });
    
    console.log('📊 Status do login:', loginResponse.status);
    console.log('📋 Headers do login:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginResult = await loginResponse.text();
    console.log('📄 Resposta do login:', loginResult);
    
    // Verificar se há cookies de sessão
    const setCookieHeaders = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies definidos:', setCookieHeaders ? 'Sim' : 'Não');
    if (setCookieHeaders) {
      console.log('🍪 Detalhes dos cookies:', setCookieHeaders);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testDirectAuth();