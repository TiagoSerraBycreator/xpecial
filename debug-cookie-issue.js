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

function parseCookies(cookieHeaders) {
  const cookies = {};
  cookieHeaders.forEach(cookieHeader => {
    const [nameValue] = cookieHeader.split(';');
    const [name, value] = nameValue.split('=');
    if (name && value) {
      cookies[name.trim()] = value.trim();
    }
  });
  return cookies;
}

async function investigateCookieIssue() {
  console.log('🍪 INVESTIGAÇÃO DETALHADA DE COOKIES');
  console.log('=' .repeat(50));

  try {
    // Passo 1: Acessar página de login
    console.log('\n📄 PASSO 1: Acessando página de login');
    const loginPageResponse = await makeRequest(`${BASE_URL}/login`);
    
    console.log(`Status: ${loginPageResponse.statusCode}`);
    console.log(`Cookies recebidos: ${loginPageResponse.cookies.length}`);
    
    const initialCookies = parseCookies(loginPageResponse.cookies);
    console.log('Cookies iniciais:', initialCookies);

    // Passo 2: Obter CSRF sem cookies
    console.log('\n🔐 PASSO 2: CSRF sem cookies');
    const csrfWithoutCookies = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    console.log(`Status: ${csrfWithoutCookies.statusCode}`);
    
    const csrfData1 = JSON.parse(csrfWithoutCookies.body);
    console.log(`CSRF Token: ${csrfData1.csrfToken.substring(0, 20)}...`);

    // Passo 3: Obter CSRF com cookies
    console.log('\n🔐 PASSO 3: CSRF com cookies');
    const cookieString = loginPageResponse.cookies.map(c => c.split(';')[0]).join('; ');
    
    const csrfWithCookies = await makeRequest(`${BASE_URL}/api/auth/csrf`, {
      headers: {
        'Cookie': cookieString
      }
    });
    
    console.log(`Status: ${csrfWithCookies.statusCode}`);
    console.log(`Novos cookies: ${csrfWithCookies.cookies.length}`);
    
    const allCookies = [...loginPageResponse.cookies, ...csrfWithCookies.cookies];
    const parsedAllCookies = parseCookies(allCookies);
    console.log('Todos os cookies:', parsedAllCookies);

    const csrfData2 = JSON.parse(csrfWithCookies.body);
    console.log(`CSRF Token: ${csrfData2.csrfToken.substring(0, 20)}...`);

    // Passo 4: Login sem cookies (sabemos que funciona)
    console.log('\n✅ PASSO 4: Login SEM cookies');
    await testLogin('Sem cookies', {}, csrfData1.csrfToken);

    // Passo 5: Login com cookies (sabemos que falha)
    console.log('\n❌ PASSO 5: Login COM cookies');
    const finalCookieString = allCookies.map(c => c.split(';')[0]).join('; ');
    await testLogin('Com todos os cookies', { 'Cookie': finalCookieString }, csrfData2.csrfToken);

    // Passo 6: Testar cookies individuais
    console.log('\n🧪 PASSO 6: Testando cookies individuais');
    
    for (const [cookieName, cookieValue] of Object.entries(parsedAllCookies)) {
      console.log(`\n   Testando cookie: ${cookieName}`);
      await testLogin(`Cookie ${cookieName}`, { 'Cookie': `${cookieName}=${cookieValue}` }, csrfData1.csrfToken);
    }

    // Passo 7: Testar combinações específicas
    console.log('\n🔬 PASSO 7: Testando combinações específicas');
    
    // Apenas cookies do NextAuth
    const nextAuthCookies = Object.entries(parsedAllCookies)
      .filter(([name]) => name.includes('next-auth') || name.includes('__Secure-next-auth'))
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    
    if (nextAuthCookies) {
      console.log('\n   Testando apenas cookies NextAuth');
      await testLogin('Apenas NextAuth cookies', { 'Cookie': nextAuthCookies }, csrfData2.csrfToken);
    }

    // Apenas cookies de sessão
    const sessionCookies = Object.entries(parsedAllCookies)
      .filter(([name]) => name.includes('session') || name.includes('csrf'))
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
    
    if (sessionCookies) {
      console.log('\n   Testando apenas cookies de sessão');
      await testLogin('Apenas session cookies', { 'Cookie': sessionCookies }, csrfData2.csrfToken);
    }

  } catch (error) {
    console.error('❌ Erro na investigação:', error.message);
  }
}

async function testLogin(testName, headers, csrfToken) {
  try {
    const formData = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      csrfToken: csrfToken,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const response = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        ...headers
      },
      body: formData.toString()
    });

    const success = response.statusCode === 200;
    const icon = success ? '✅' : '❌';
    
    console.log(`      ${icon} ${testName}: Status ${response.statusCode}`);
    
    if (!success) {
      console.log(`         Erro: ${response.body.substring(0, 80)}...`);
      
      // Se for erro de credenciais, vamos ver mais detalhes
      if (response.body.includes('CredentialsSignin')) {
        console.log(`         Headers de resposta:`, Object.keys(response.headers));
        if (response.headers['x-vercel-id']) {
          console.log(`         Vercel ID: ${response.headers['x-vercel-id']}`);
        }
      }
    }

    return success;
    
  } catch (error) {
    console.log(`      ❌ ${testName}: Erro - ${error.message}`);
    return false;
  }
}

async function testCSRFTokenIssue() {
  console.log('\n🎯 TESTE ESPECÍFICO: CSRF Token com/sem cookies');
  console.log('=' .repeat(50));

  try {
    // Obter CSRF sem cookies
    const csrfResponse1 = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    const csrfData1 = JSON.parse(csrfResponse1.body);
    
    // Obter cookies da página de login
    const loginPageResponse = await makeRequest(`${BASE_URL}/login`);
    const cookieString = loginPageResponse.cookies.map(c => c.split(';')[0]).join('; ');
    
    // Obter CSRF com cookies
    const csrfResponse2 = await makeRequest(`${BASE_URL}/api/auth/csrf`, {
      headers: { 'Cookie': cookieString }
    });
    const csrfData2 = JSON.parse(csrfResponse2.body);

    console.log(`CSRF sem cookies: ${csrfData1.csrfToken.substring(0, 30)}...`);
    console.log(`CSRF com cookies: ${csrfData2.csrfToken.substring(0, 30)}...`);
    console.log(`Tokens são iguais: ${csrfData1.csrfToken === csrfData2.csrfToken}`);

    // Testar cross-validation: usar token sem cookies com cookies
    console.log('\n🔄 Teste cruzado: Token sem cookies + enviar cookies');
    await testLogin('Token sem cookies + cookies', { 'Cookie': cookieString }, csrfData1.csrfToken);

    console.log('\n🔄 Teste cruzado: Token com cookies + sem enviar cookies');
    await testLogin('Token com cookies + sem cookies', {}, csrfData2.csrfToken);

  } catch (error) {
    console.error('❌ Erro no teste CSRF:', error.message);
  }
}

async function main() {
  await investigateCookieIssue();
  await testCSRFTokenIssue();
  
  console.log('\n📊 ANÁLISE FINAL:');
  console.log('Se o problema está nos cookies, pode ser:');
  console.log('1. 🍪 Cookie específico causando conflito');
  console.log('2. 🔐 CSRF token não validando com cookies');
  console.log('3. 🔒 Sessão sendo invalidada por algum motivo');
  console.log('4. ⚙️  Configuração do NextAuth com cookies');
  console.log('5. 🛡️  Middleware interferindo quando há cookies');
}

main().catch(console.error);