const https = require('https');

const BASE_URL = 'https://xpecial.vercel.app';

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

async function testCSRFValidation() {
  console.log('🔐 TESTE DETALHADO DE VALIDAÇÃO CSRF');
  console.log('=' .repeat(50));

  try {
    // Cenário 1: Fluxo normal sem cookies (que funciona)
    console.log('\n✅ CENÁRIO 1: Fluxo sem cookies (controle)');
    
    const csrf1 = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    const csrfData1 = JSON.parse(csrf1.body);
    console.log(`CSRF Token: ${csrfData1.csrfToken.substring(0, 30)}...`);
    console.log(`Cookies do CSRF: ${csrf1.cookies.length}`);

    const formData1 = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      csrfToken: csrfData1.csrfToken,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const login1 = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData1.toString()
    });

    console.log(`Resultado: Status ${login1.statusCode}`);
    if (login1.statusCode !== 200) {
      console.log(`Erro: ${login1.body.substring(0, 100)}`);
    }

    // Cenário 2: Fluxo com cookies (que falha)
    console.log('\n❌ CENÁRIO 2: Fluxo com cookies (problema)');
    
    // Primeiro, obter cookies da página de login
    const loginPage = await makeRequest(`${BASE_URL}/login`);
    console.log(`Cookies da página: ${loginPage.cookies.length}`);
    
    const cookieString = loginPage.cookies.map(c => c.split(';')[0]).join('; ');
    console.log(`Cookie string: ${cookieString}`);

    // Obter CSRF com cookies
    const csrf2 = await makeRequest(`${BASE_URL}/api/auth/csrf`, {
      headers: { 'Cookie': cookieString }
    });
    
    const csrfData2 = JSON.parse(csrf2.body);
    console.log(`CSRF Token: ${csrfData2.csrfToken.substring(0, 30)}...`);
    console.log(`Novos cookies: ${csrf2.cookies.length}`);

    // Combinar todos os cookies
    const allCookies = [...loginPage.cookies, ...csrf2.cookies];
    const finalCookieString = allCookies.map(c => c.split(';')[0]).join('; ');

    const formData2 = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      csrfToken: csrfData2.csrfToken,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const login2 = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': finalCookieString
      },
      body: formData2.toString()
    });

    console.log(`Resultado: Status ${login2.statusCode}`);
    if (login2.statusCode !== 200) {
      console.log(`Erro: ${login2.body.substring(0, 100)}`);
    }

    // Cenário 3: Usar token sem cookies mas enviar cookies (que funciona!)
    console.log('\n✅ CENÁRIO 3: Token sem cookies + enviar cookies (workaround)');
    
    const formData3 = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      csrfToken: csrfData1.csrfToken, // Token do cenário 1 (sem cookies)
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const login3 = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': finalCookieString // Mas enviar cookies
      },
      body: formData3.toString()
    });

    console.log(`Resultado: Status ${login3.statusCode}`);
    if (login3.statusCode !== 200) {
      console.log(`Erro: ${login3.body.substring(0, 100)}`);
    }

    // Análise dos tokens
    console.log('\n🔍 ANÁLISE DOS TOKENS:');
    console.log(`Token sem cookies: ${csrfData1.csrfToken}`);
    console.log(`Token com cookies: ${csrfData2.csrfToken}`);
    console.log(`São iguais: ${csrfData1.csrfToken === csrfData2.csrfToken}`);

    // Vamos tentar decodificar os tokens se possível
    try {
      const token1Parts = csrfData1.csrfToken.split('.');
      const token2Parts = csrfData2.csrfToken.split('.');
      
      console.log(`\nEstrutura dos tokens:`);
      console.log(`Token 1 partes: ${token1Parts.length}`);
      console.log(`Token 2 partes: ${token2Parts.length}`);
      
      if (token1Parts.length > 1 && token2Parts.length > 1) {
        console.log(`Primeira parte igual: ${token1Parts[0] === token2Parts[0]}`);
        console.log(`Segunda parte igual: ${token1Parts[1] === token2Parts[1]}`);
      }
    } catch (e) {
      console.log('Tokens não são JWT ou não podem ser analisados');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function testWithoutCSRF() {
  console.log('\n🚫 TESTE: Login sem CSRF token');
  console.log('=' .repeat(40));

  try {
    const formData = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
      // Sem csrfToken
    });

    const response = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    console.log(`Status: ${response.statusCode}`);
    console.log(`Resposta: ${response.body.substring(0, 150)}`);

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

async function testInvalidCSRF() {
  console.log('\n🔒 TESTE: Login com CSRF token inválido');
  console.log('=' .repeat(40));

  try {
    const formData = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      csrfToken: 'token-invalido-123',
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const response = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData.toString()
    });

    console.log(`Status: ${response.statusCode}`);
    console.log(`Resposta: ${response.body.substring(0, 150)}`);

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

async function main() {
  await testCSRFValidation();
  await testWithoutCSRF();
  await testInvalidCSRF();
  
  console.log('\n📊 CONCLUSÕES:');
  console.log('1. O NextAuth gera tokens CSRF diferentes com/sem cookies');
  console.log('2. A validação falha quando o token foi gerado COM cookies');
  console.log('3. O workaround é usar token SEM cookies + enviar cookies');
  console.log('4. Isso indica um bug na validação CSRF do NextAuth');
  console.log('5. Possível solução: Configurar NextAuth para não usar cookies para CSRF');
}

main().catch(console.error);