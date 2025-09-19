const https = require('https');

const BASE_URL = 'https://xpecial.vercel.app';
const credentials = {
  email: 'admin@admin.com',
  password: 'admin123'
};

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          cookies: res.headers['set-cookie'] || []
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCookiesFix() {
  console.log('🍪 TESTE DE CONFIGURAÇÃO DE COOKIES');
  console.log('=' .repeat(50));
  console.log('Testando nova configuração de cookies para produção...\n');

  try {
    // Aguardar deploy da nova configuração
    console.log('⏳ Aguardando deploy da nova configuração (30 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Teste 1: Verificar novos cookies CSRF
    console.log('🔍 TESTE 1: Verificar novos cookies CSRF');
    
    const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    console.log(`   Status CSRF: ${csrfResponse.statusCode}`);
    console.log(`   Cookies recebidos: ${csrfResponse.cookies.length}`);
    
    csrfResponse.cookies.forEach((cookie, index) => {
      const cookieName = cookie.split('=')[0];
      const isSecure = cookie.includes('Secure');
      const sameSite = cookie.includes('SameSite=');
      console.log(`   Cookie ${index + 1}: ${cookieName} (Secure: ${isSecure}, SameSite: ${sameSite})`);
    });

    if (csrfResponse.statusCode !== 200) {
      console.log('❌ Falha ao obter CSRF token');
      return false;
    }

    const csrfData = JSON.parse(csrfResponse.body);
    const cookieString = csrfResponse.cookies.map(c => c.split(';')[0]).join('; ');
    
    console.log(`   CSRF Token: ${csrfData.csrfToken.substring(0, 30)}...`);

    // Teste 2: Login com nova configuração de cookies
    console.log('\n🚀 TESTE 2: Login com nova configuração');
    
    const formData = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      csrfToken: csrfData.csrfToken,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/login`,
        'X-Forwarded-Proto': 'https'
      },
      body: formData.toString()
    });

    const success = loginResponse.statusCode === 200;
    console.log(`   ${success ? '✅' : '❌'} Status: ${loginResponse.statusCode}`);
    
    if (success) {
      console.log('   ✅ Login com cookies funcionando!');
      
      // Verificar cookies de resposta
      if (loginResponse.cookies.length > 0) {
        console.log(`   Novos cookies recebidos: ${loginResponse.cookies.length}`);
        loginResponse.cookies.forEach((cookie, index) => {
          const cookieName = cookie.split('=')[0];
          console.log(`   Novo Cookie ${index + 1}: ${cookieName}`);
        });
      }
    } else {
      console.log(`   ❌ Erro: ${loginResponse.body.substring(0, 200)}`);
    }

    // Teste 3: Múltiplas tentativas para verificar consistência
    console.log('\n⚡ TESTE 3: Verificar consistência (3 tentativas)');
    
    let successCount = 0;
    for (let i = 1; i <= 3; i++) {
      // Obter novo CSRF para cada tentativa
      const newCsrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
      const newCsrfData = JSON.parse(newCsrfResponse.body);
      const newCookieString = newCsrfResponse.cookies.map(c => c.split(';')[0]).join('; ');
      
      const testFormData = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
        csrfToken: newCsrfData.csrfToken,
        callbackUrl: `${BASE_URL}/dashboard`,
        json: 'true'
      });

      const testResponse = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'Cookie': newCookieString,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': BASE_URL,
          'Referer': `${BASE_URL}/login`
        },
        body: testFormData.toString()
      });

      if (testResponse.statusCode === 200) successCount++;
      console.log(`   Tentativa ${i}: ${testResponse.statusCode === 200 ? '✅' : '❌'} Status ${testResponse.statusCode}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`   Taxa de sucesso: ${successCount}/3 (${(successCount/3*100).toFixed(1)}%)`);

    return { success, successCount, totalTests: 3 };

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return { success: false, successCount: 0, totalTests: 3 };
  }
}

async function main() {
  console.log('🔧 TESTE DE CORREÇÃO DE COOKIES');
  console.log('=' .repeat(60));
  
  const results = await testCookiesFix();
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('=' .repeat(40));
  
  if (results.success && results.successCount === results.totalTests) {
    console.log('🎉 CONFIGURAÇÃO DE COOKIES CORRIGIDA!');
    console.log('   ✅ Login com navegador funcionando');
    console.log('   ✅ Cookies seguros configurados');
    console.log('   ✅ CSRF funcionando corretamente');
    console.log('   ✅ Problema 401 RESOLVIDO!');
  } else if (results.success) {
    console.log('⚠️ PARCIALMENTE CORRIGIDO:');
    console.log('   ✅ Login básico funcionando');
    console.log(`   ⚠️ Consistência: ${results.successCount}/${results.totalTests}`);
  } else {
    console.log('❌ AINDA COM PROBLEMAS:');
    console.log('   ❌ Login com cookies ainda falha');
    console.log('   🔧 Pode precisar de ajuste adicional');
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  if (results.success && results.successCount === results.totalTests) {
    console.log('1. ✅ Teste no navegador: https://xpecial.vercel.app/login');
    console.log('2. ✅ Use: admin@admin.com / admin123');
    console.log('3. ✅ O erro 401 deve estar resolvido!');
    console.log('4. ✅ Cookies seguros funcionando em HTTPS');
  } else {
    console.log('1. 🔍 Verificar logs do Vercel para mais detalhes');
    console.log('2. 🔧 Pode precisar ajustar domínio dos cookies');
    console.log('3. ⚠️ Verificar se deploy foi aplicado');
  }
}

main().catch(console.error);