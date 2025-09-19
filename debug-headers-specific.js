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
          body: data
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

async function testSpecificHeaders() {
  console.log('🔍 TESTE DE HEADERS ESPECÍFICOS');
  console.log('=' .repeat(50));

  // Headers base que funcionam
  const baseHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  // Headers suspeitos do navegador
  const suspectHeaders = [
    { name: 'User-Agent', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
    { name: 'Accept-Language', value: 'pt-BR,pt;q=0.9,en;q=0.8' },
    { name: 'Origin', value: BASE_URL },
    { name: 'Referer', value: `${BASE_URL}/login` },
    { name: 'Sec-Fetch-Dest', value: 'empty' },
    { name: 'Sec-Fetch-Mode', value: 'cors' },
    { name: 'Sec-Fetch-Site', value: 'same-origin' },
    { name: 'X-Requested-With', value: 'XMLHttpRequest' },
    { name: 'Accept-Encoding', value: 'gzip, deflate, br' },
    { name: 'Connection', value: 'keep-alive' }
  ];

  // Obter CSRF token
  const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
  const csrfData = JSON.parse(csrfResponse.body);
  const csrfToken = csrfData.csrfToken;

  console.log(`✅ CSRF Token obtido: ${csrfToken.substring(0, 20)}...`);

  // Teste 1: Headers base (sabemos que funciona)
  console.log('\n📋 TESTE 1: Headers base (controle)');
  await testLogin('Headers base', baseHeaders, csrfToken);

  // Teste 2: Adicionar cada header suspeito um por vez
  for (const header of suspectHeaders) {
    console.log(`\n📋 TESTE: Adicionando ${header.name}`);
    const testHeaders = {
      ...baseHeaders,
      [header.name]: header.value
    };
    await testLogin(`Base + ${header.name}`, testHeaders, csrfToken);
  }

  // Teste 3: Combinações específicas
  console.log('\n📋 TESTE: Combinação Origin + Referer');
  await testLogin('Origin + Referer', {
    ...baseHeaders,
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/login`
  }, csrfToken);

  console.log('\n📋 TESTE: Todos os Sec-Fetch headers');
  await testLogin('Sec-Fetch headers', {
    ...baseHeaders,
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin'
  }, csrfToken);

  console.log('\n📋 TESTE: User-Agent + Origin + Referer');
  await testLogin('UA + Origin + Referer', {
    ...baseHeaders,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': BASE_URL,
    'Referer': `${BASE_URL}/login`
  }, csrfToken);
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
      headers: headers,
      body: formData.toString()
    });

    const success = response.statusCode === 200;
    const icon = success ? '✅' : '❌';
    
    console.log(`   ${icon} ${testName}: Status ${response.statusCode}`);
    
    if (!success) {
      console.log(`      Erro: ${response.body.substring(0, 100)}`);
    }

    return success;
    
  } catch (error) {
    console.log(`   ❌ ${testName}: Erro - ${error.message}`);
    return false;
  }
}

async function testCookieIssues() {
  console.log('\n🍪 TESTE DE COOKIES');
  console.log('=' .repeat(30));

  try {
    // Simular fluxo completo com cookies
    console.log('1. Acessando página de login...');
    const loginPageResponse = await makeRequest(`${BASE_URL}/login`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    let cookies = [];
    if (loginPageResponse.headers['set-cookie']) {
      cookies = loginPageResponse.headers['set-cookie'];
      console.log(`   Cookies recebidos: ${cookies.length}`);
      cookies.forEach(cookie => {
        console.log(`   - ${cookie.split(';')[0]}`);
      });
    }

    console.log('\n2. Obtendo CSRF com cookies...');
    const cookieString = cookies.map(c => c.split(';')[0]).join('; ');
    
    const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`, {
      headers: {
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    console.log(`   Status CSRF: ${csrfResponse.statusCode}`);
    
    if (csrfResponse.headers['set-cookie']) {
      const newCookies = csrfResponse.headers['set-cookie'];
      cookies = [...cookies, ...newCookies];
      console.log(`   Novos cookies: ${newCookies.length}`);
    }

    const csrfData = JSON.parse(csrfResponse.body);
    const csrfToken = csrfData.csrfToken;

    console.log('\n3. Fazendo login com todos os cookies...');
    const finalCookieString = cookies.map(c => c.split(';')[0]).join('; ');
    
    const formData = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      csrfToken: csrfToken,
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
    console.log(`   ${success ? '✅' : '❌'} Login com cookies: Status ${loginResponse.statusCode}`);
    
    if (!success) {
      console.log(`   Erro: ${loginResponse.body.substring(0, 150)}`);
    }

  } catch (error) {
    console.error('❌ Erro no teste de cookies:', error.message);
  }
}

async function main() {
  await testSpecificHeaders();
  await testCookieIssues();
  
  console.log('\n📊 CONCLUSÕES:');
  console.log('- Se um header específico causa o erro, é um problema de configuração');
  console.log('- Se o problema persiste mesmo com cookies corretos, pode ser:');
  console.log('  1. Problema na função authorize do NextAuth');
  console.log('  2. Configuração de CORS específica');
  console.log('  3. Middleware interferindo');
  console.log('  4. Problema de timing/rate limiting');
}

main().catch(console.error);