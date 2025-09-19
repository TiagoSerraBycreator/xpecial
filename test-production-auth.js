const fetch = require('node-fetch');

const PRODUCTION_URL = 'https://xpecial.vercel.app';

async function testProductionAuth() {
  console.log('🔍 Testando autenticação em produção...');
  console.log('🌐 URL:', PRODUCTION_URL);
  
  try {
    // 1. Testar se a API de CSRF está funcionando
    console.log('\n1️⃣ Testando CSRF token...');
    const csrfResponse = await fetch(`${PRODUCTION_URL}/api/auth/csrf`);
    console.log('📊 Status CSRF:', csrfResponse.status);
    
    if (csrfResponse.ok) {
      const csrfData = await csrfResponse.json();
      console.log('✅ CSRF Token obtido:', csrfData.csrfToken?.substring(0, 20) + '...');
      
      // 2. Testar login com credenciais
      console.log('\n2️⃣ Testando login...');
      const loginData = {
        email: 'admin@admin.com',
        password: 'admin123',
        csrfToken: csrfData.csrfToken,
        callbackUrl: `${PRODUCTION_URL}/dashboard`,
        json: true
      };
      
      console.log('📤 Dados do login:', {
        email: loginData.email,
        password: '***',
        csrfToken: loginData.csrfToken?.substring(0, 20) + '...',
        callbackUrl: loginData.callbackUrl
      });
      
      const loginResponse = await fetch(`${PRODUCTION_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': csrfResponse.headers.get('set-cookie') || ''
        },
        body: new URLSearchParams(loginData)
      });
      
      console.log('📊 Status Login:', loginResponse.status);
      console.log('📋 Headers:', Object.fromEntries(loginResponse.headers.entries()));
      
      const loginResult = await loginResponse.text();
      console.log('📥 Resposta do login:', loginResult.substring(0, 500));
      
    } else {
      const csrfError = await csrfResponse.text();
      console.log('❌ Erro CSRF:', csrfError);
    }
    
    // 3. Testar endpoint de providers
    console.log('\n3️⃣ Testando providers...');
    const providersResponse = await fetch(`${PRODUCTION_URL}/api/auth/providers`);
    console.log('📊 Status Providers:', providersResponse.status);
    
    if (providersResponse.ok) {
      const providers = await providersResponse.json();
      console.log('✅ Providers:', Object.keys(providers));
    }
    
    // 4. Testar endpoint de session
    console.log('\n4️⃣ Testando session...');
    const sessionResponse = await fetch(`${PRODUCTION_URL}/api/auth/session`);
    console.log('📊 Status Session:', sessionResponse.status);
    
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      console.log('📋 Session:', session);
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testProductionAuth();