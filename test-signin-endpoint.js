const fetch = require('node-fetch');

async function getCSRFToken() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/csrf');
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Erro ao obter CSRF token:', error);
    return null;
  }
}

async function testSignInEndpoint() {
  try {
    console.log('🔍 Testando endpoint de signin...');
    
    // Primeiro, obter o CSRF token
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      console.log('❌ Não foi possível obter CSRF token');
      return;
    }
    
    console.log('✅ CSRF token obtido');
    
    // Testar o endpoint de signin específico para credentials
    const signinResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'admin@xpecial.com',
        password: 'admin123',
        csrfToken: csrfToken,
        callbackUrl: 'http://localhost:3000/dashboard',
        json: 'true'
      })
    });
    
    console.log('📊 Status do signin:', signinResponse.status);
    console.log('📋 Headers do signin:', Object.fromEntries(signinResponse.headers.entries()));
    
    const signinText = await signinResponse.text();
    console.log('📄 Resposta do signin:', signinText);
    
    // Verificar se há cookies de sessão
    const cookies = signinResponse.headers.get('set-cookie');
    if (cookies) {
      console.log('🍪 Cookies definidos:', cookies.includes('next-auth.session-token') ? 'Sim' : 'Não');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de signin:', error);
  }
}

testSignInEndpoint();