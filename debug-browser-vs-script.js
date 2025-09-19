const https = require('https');
const http = require('http');

// Configurações
const BASE_URL = 'https://xpecial.vercel.app';
const credentials = {
  email: 'admin@admin.com',
  password: 'admin123'
};

console.log('🔍 INVESTIGAÇÃO AVANÇADA: Navegador vs Script');
console.log('=' .repeat(60));

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      ...options
    };

    const req = client.request(requestOptions, (res) => {
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

async function testBrowserLikeRequest() {
  console.log('\n🌐 TESTE 1: Simulando requisição exata do navegador');
  
  try {
    // 1. Primeiro, obter a página de login para pegar cookies iniciais
    console.log('📄 Obtendo página de login...');
    const loginPage = await makeRequest(`${BASE_URL}/login`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
      }
    });
    
    console.log(`Status da página de login: ${loginPage.statusCode}`);
    console.log(`Cookies recebidos: ${loginPage.cookies.length}`);
    
    // Extrair cookies
    let cookieString = '';
    if (loginPage.cookies.length > 0) {
      cookieString = loginPage.cookies.map(cookie => cookie.split(';')[0]).join('; ');
      console.log(`Cookie string: ${cookieString}`);
    }

    // 2. Obter CSRF token
    console.log('\n🔐 Obtendo CSRF token...');
    const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Referer': `${BASE_URL}/login`,
        'Cookie': cookieString
      }
    });
    
    console.log(`Status CSRF: ${csrfResponse.statusCode}`);
    
    let csrfToken = '';
    if (csrfResponse.statusCode === 200) {
      const csrfData = JSON.parse(csrfResponse.body);
      csrfToken = csrfData.csrfToken;
      console.log(`CSRF Token obtido: ${csrfToken.substring(0, 20)}...`);
      
      // Atualizar cookies se houver novos
      if (csrfResponse.cookies.length > 0) {
        const newCookies = csrfResponse.cookies.map(cookie => cookie.split(';')[0]).join('; ');
        cookieString = cookieString ? `${cookieString}; ${newCookies}` : newCookies;
      }
    }

    // 3. Fazer a requisição de login exatamente como o navegador
    console.log('\n🔑 Fazendo requisição de login...');
    
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/login`,
        'Cookie': cookieString,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData.toString()
    });

    console.log(`\n📊 RESULTADO DO LOGIN:`);
    console.log(`Status: ${loginResponse.statusCode}`);
    console.log(`Headers de resposta:`, Object.keys(loginResponse.headers));
    console.log(`Novos cookies: ${loginResponse.cookies.length}`);
    
    if (loginResponse.statusCode === 200) {
      console.log('✅ Login bem-sucedido!');
      try {
        const responseData = JSON.parse(loginResponse.body);
        console.log('Dados da resposta:', responseData);
      } catch (e) {
        console.log('Corpo da resposta (não JSON):', loginResponse.body.substring(0, 200));
      }
    } else {
      console.log('❌ Login falhou!');
      console.log('Corpo da resposta:', loginResponse.body);
      console.log('Headers completos:', loginResponse.headers);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function testWithDifferentConfigs() {
  console.log('\n🧪 TESTE 2: Testando diferentes configurações');
  
  const configs = [
    {
      name: 'Sem User-Agent',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    {
      name: 'User-Agent Chrome mais antigo',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    },
    {
      name: 'Headers mínimos + Origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/login`
      }
    }
  ];

  for (const config of configs) {
    console.log(`\n🔧 Testando: ${config.name}`);
    
    try {
      // Obter CSRF
      const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
      const csrfData = JSON.parse(csrfResponse.body);
      
      const formData = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
        csrfToken: csrfData.csrfToken,
        callbackUrl: `${BASE_URL}/dashboard`,
        json: 'true'
      });

      const response = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: config.headers,
        body: formData.toString()
      });

      console.log(`   Status: ${response.statusCode}`);
      if (response.statusCode !== 200) {
        console.log(`   Erro: ${response.body.substring(0, 100)}`);
      }
      
    } catch (error) {
      console.log(`   Erro: ${error.message}`);
    }
  }
}

async function checkNextAuthInternals() {
  console.log('\n🔍 TESTE 3: Verificando internos do NextAuth');
  
  try {
    // Verificar configuração atual
    const configResponse = await makeRequest(`${BASE_URL}/api/auth/providers`);
    console.log(`Status providers: ${configResponse.statusCode}`);
    
    if (configResponse.statusCode === 200) {
      const providers = JSON.parse(configResponse.body);
      console.log('Providers disponíveis:', Object.keys(providers));
      
      if (providers.credentials) {
        console.log('Provider credentials configurado:', {
          id: providers.credentials.id,
          name: providers.credentials.name,
          type: providers.credentials.type
        });
      }
    }

    // Verificar sessão atual
    const sessionResponse = await makeRequest(`${BASE_URL}/api/auth/session`);
    console.log(`Status session: ${sessionResponse.statusCode}`);
    
    if (sessionResponse.statusCode === 200) {
      const session = JSON.parse(sessionResponse.body);
      console.log('Sessão atual:', session);
    }

  } catch (error) {
    console.error('Erro ao verificar NextAuth:', error.message);
  }
}

async function main() {
  await testBrowserLikeRequest();
  await testWithDifferentConfigs();
  await checkNextAuthInternals();
  
  console.log('\n📋 RESUMO DA INVESTIGAÇÃO:');
  console.log('1. Se o teste browser-like funcionou mas o navegador não, pode ser:');
  console.log('   - Problema com JavaScript no frontend');
  console.log('   - Configuração específica do domínio');
  console.log('   - Problema com HTTPS/certificados');
  console.log('2. Se todos os testes falharam, o problema está na API');
  console.log('3. Verifique os logs da Vercel para mais detalhes');
}

main().catch(console.error);