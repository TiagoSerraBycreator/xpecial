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

async function testFixedConfiguration() {
  console.log('🔧 TESTE DA CORREÇÃO DO NEXTAUTH');
  console.log('=' .repeat(50));
  console.log('Aguardando deploy da correção...\n');

  // Aguardar um pouco para o deploy
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Teste 1: Fluxo completo simulando navegador
    console.log('🌐 TESTE 1: Fluxo completo do navegador');
    
    // Passo 1: Acessar página de login
    const loginPage = await makeRequest(`${BASE_URL}/login`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`   Página de login: Status ${loginPage.statusCode}`);
    console.log(`   Cookies iniciais: ${loginPage.cookies.length}`);

    // Passo 2: Obter CSRF com cookies
    const cookieString = loginPage.cookies.map(c => c.split(';')[0]).join('; ');
    
    const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`, {
      headers: {
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    console.log(`   CSRF: Status ${csrfResponse.statusCode}`);
    console.log(`   Novos cookies: ${csrfResponse.cookies.length}`);
    
    const csrfData = JSON.parse(csrfResponse.body);
    console.log(`   CSRF Token: ${csrfData.csrfToken.substring(0, 30)}...`);

    // Combinar todos os cookies
    const allCookies = [...loginPage.cookies, ...csrfResponse.cookies];
    const finalCookieString = allCookies.map(c => c.split(';')[0]).join('; ');

    // Passo 3: Fazer login com configuração corrigida
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
        'Cookie': finalCookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/login`
      },
      body: formData.toString()
    });

    const success = loginResponse.statusCode === 200;
    console.log(`   ${success ? '✅' : '❌'} Login: Status ${loginResponse.statusCode}`);
    
    if (success) {
      console.log('   🎉 CORREÇÃO FUNCIONOU! Login bem-sucedido!');
      try {
        const responseData = JSON.parse(loginResponse.body);
        console.log(`   Redirecionamento: ${responseData.url}`);
      } catch (e) {
        console.log('   Resposta não é JSON válido');
      }
    } else {
      console.log(`   ❌ Ainda há problema: ${loginResponse.body.substring(0, 100)}`);
    }

    // Teste 2: Verificar se os tokens CSRF agora são consistentes
    console.log('\n🔍 TESTE 2: Consistência dos tokens CSRF');
    
    const csrf1 = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    const csrfData1 = JSON.parse(csrf1.body);
    
    const csrf2 = await makeRequest(`${BASE_URL}/api/auth/csrf`, {
      headers: { 'Cookie': finalCookieString }
    });
    const csrfData2 = JSON.parse(csrf2.body);
    
    console.log(`   Token sem cookies: ${csrfData1.csrfToken.substring(0, 30)}...`);
    console.log(`   Token com cookies: ${csrfData2.csrfToken.substring(0, 30)}...`);
    console.log(`   ${csrfData1.csrfToken === csrfData2.csrfToken ? '✅' : '❌'} Tokens são iguais: ${csrfData1.csrfToken === csrfData2.csrfToken}`);

    // Teste 3: Verificar configuração de cookies
    console.log('\n🍪 TESTE 3: Verificação de cookies');
    
    csrfResponse.cookies.forEach((cookie, index) => {
      console.log(`   Cookie ${index + 1}: ${cookie}`);
      if (cookie.includes('csrf-token')) {
        console.log('   ✅ Cookie CSRF personalizado encontrado!');
      }
    });

    return success;

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return false;
  }
}

async function testMultipleAttempts() {
  console.log('\n🔄 TESTE 4: Múltiplas tentativas de login');
  console.log('=' .repeat(40));

  for (let i = 1; i <= 3; i++) {
    console.log(`\n   Tentativa ${i}:`);
    
    try {
      // Obter CSRF
      const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
      const csrfData = JSON.parse(csrfResponse.body);
      
      // Login
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
          'Accept': 'application/json'
        },
        body: formData.toString()
      });

      const success = loginResponse.statusCode === 200;
      console.log(`      ${success ? '✅' : '❌'} Status: ${loginResponse.statusCode}`);
      
    } catch (error) {
      console.log(`      ❌ Erro: ${error.message}`);
    }
    
    // Aguardar entre tentativas
    if (i < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function main() {
  console.log('🚀 VERIFICAÇÃO DA CORREÇÃO DO PROBLEMA DE LOGIN');
  console.log('=' .repeat(60));
  
  const fixed = await testFixedConfiguration();
  await testMultipleAttempts();
  
  console.log('\n📊 RESULTADO FINAL:');
  if (fixed) {
    console.log('✅ PROBLEMA RESOLVIDO!');
    console.log('   - A configuração de cookies do NextAuth foi corrigida');
    console.log('   - O login no navegador deve funcionar agora');
    console.log('   - Teste no navegador: limpe o cache e tente fazer login');
  } else {
    console.log('❌ Problema ainda persiste');
    console.log('   - Pode ser necessário aguardar o deploy');
    console.log('   - Ou implementar uma solução alternativa');
  }
  
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('1. Aguarde alguns minutos para o deploy na Vercel');
  console.log('2. Limpe o cache do navegador (Ctrl+Shift+Delete)');
  console.log('3. Teste o login em modo incógnito');
  console.log('4. Use as credenciais: admin@admin.com / admin123');
}

main().catch(console.error);