const fetch = require('node-fetch');

const PRODUCTION_URL = 'https://xpecial.vercel.app';

async function testNextAuthDetailed() {
  console.log('🔍 Teste detalhado do NextAuth em produção...');
  console.log('🌐 URL:', PRODUCTION_URL);
  
  try {
    // 1. Obter CSRF token
    console.log('\n1️⃣ Obtendo CSRF token...');
    const csrfResponse = await fetch(`${PRODUCTION_URL}/api/auth/csrf`);
    console.log('📊 Status CSRF:', csrfResponse.status);
    
    if (!csrfResponse.ok) {
      console.log('❌ Erro ao obter CSRF token');
      return;
    }
    
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    console.log('✅ CSRF Token:', csrfToken.substring(0, 20) + '...');
    
    // Obter cookies
    const cookies = csrfResponse.headers.get('set-cookie') || '';
    console.log('🍪 Cookies:', cookies);
    
    // 2. Testar signin com diferentes formatos
    console.log('\n2️⃣ Testando signin...');
    
    // Formato 1: application/json
    console.log('\n📤 Teste 1: application/json');
    const jsonResponse = await fetch(`${PRODUCTION_URL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123',
        csrfToken: csrfToken,
        callbackUrl: `${PRODUCTION_URL}/dashboard`
      })
    });
    
    console.log('📊 Status JSON:', jsonResponse.status);
    console.log('📋 Headers JSON:', Object.fromEntries(jsonResponse.headers.entries()));
    const jsonResult = await jsonResponse.text();
    console.log('📥 Resposta JSON:', jsonResult.substring(0, 300));
    
    // Formato 2: application/x-www-form-urlencoded
    console.log('\n📤 Teste 2: form-urlencoded');
    const formData = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      csrfToken: csrfToken,
      callbackUrl: `${PRODUCTION_URL}/dashboard`
    });
    
    const formResponse = await fetch(`${PRODUCTION_URL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies
      },
      body: formData
    });
    
    console.log('📊 Status Form:', formResponse.status);
    console.log('📋 Headers Form:', Object.fromEntries(formResponse.headers.entries()));
    const formResult = await formResponse.text();
    console.log('📥 Resposta Form:', formResult.substring(0, 300));
    
    // 3. Testar callback credentials
    console.log('\n3️⃣ Testando callback credentials...');
    const callbackResponse = await fetch(`${PRODUCTION_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies
      },
      body: formData
    });
    
    console.log('📊 Status Callback:', callbackResponse.status);
    console.log('📋 Headers Callback:', Object.fromEntries(callbackResponse.headers.entries()));
    const callbackResult = await callbackResponse.text();
    console.log('📥 Resposta Callback:', callbackResult.substring(0, 300));
    
    // 4. Verificar se há redirecionamento
    if (callbackResponse.headers.get('location')) {
      console.log('🔄 Redirecionamento para:', callbackResponse.headers.get('location'));
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testNextAuthDetailed();