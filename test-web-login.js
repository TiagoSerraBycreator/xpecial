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

async function testWebLogin() {
  try {
    console.log('🔍 Testando login via web...');
    
    // Primeiro, obter o CSRF token
    console.log('🔐 Obtendo CSRF token...');
    const csrfToken = await getCSRFToken();
    
    if (!csrfToken) {
      console.log('❌ Não foi possível obter CSRF token');
      return;
    }
    
    console.log('✅ CSRF token obtido:', csrfToken.substring(0, 20) + '...');
    
    // Agora fazer o login
    console.log('🚀 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
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
    
    console.log('📊 Status do login:', loginResponse.status);
    console.log('📋 Headers do login:', Object.fromEntries(loginResponse.headers.entries()));
    
    const loginText = await loginResponse.text();
    console.log('📄 Resposta do login:', loginText);
    
    if (loginResponse.status === 200) {
      console.log('✅ Login bem-sucedido!');
    } else {
      console.log('❌ Falha no login');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste de login:', error);
  }
}

testWebLogin();