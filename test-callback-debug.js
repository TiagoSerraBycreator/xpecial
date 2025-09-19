const https = require('https');
const { URL } = require('url');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://xpecial-9bswkhjmb-tiagos-projects-39da614a.vercel.app',
        'Referer': 'https://xpecial-9bswkhjmb-tiagos-projects-39da614a.vercel.app/login',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
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

async function testCallbackDebug() {
  console.log('🔍 Debugando erro 401 na API de callback...\n');

  const baseUrl = 'https://xpecial-9bswkhjmb-tiagos-projects-39da614a.vercel.app';
  
  // 1. Primeiro, vamos obter o CSRF token
  console.log('1️⃣ Obtendo CSRF token...');
  try {
    const csrfResponse = await makeRequest(`${baseUrl}/api/auth/csrf`);
    console.log('📊 Status CSRF:', csrfResponse.status);
    console.log('📥 Resposta CSRF:', csrfResponse.data);
    
    let csrfToken = null;
    if (csrfResponse.data) {
      try {
        const csrfData = JSON.parse(csrfResponse.data);
        csrfToken = csrfData.csrfToken;
        console.log('🔑 CSRF Token obtido:', csrfToken ? 'Sim' : 'Não');
      } catch (e) {
        console.log('❌ Erro ao parsear CSRF:', e.message);
      }
    }

    // 2. Testar a API de callback com diferentes formatos
    console.log('\n2️⃣ Testando callback com POST JSON...');
    
    const credentials = {
      email: 'admin@admin.com',
      password: 'admin123',
      callbackUrl: `${baseUrl}/dashboard`
    };

    if (csrfToken) {
      credentials.csrfToken = csrfToken;
    }

    const callbackResponse = await makeRequest(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(credentials)
    });

    console.log('📊 Status Callback:', callbackResponse.status);
    console.log('📋 Headers:', JSON.stringify(callbackResponse.headers, null, 2));
    console.log('📥 Resposta:', callbackResponse.data.substring(0, 500));

    // 3. Testar com form-urlencoded
    console.log('\n3️⃣ Testando callback com form-urlencoded...');
    
    const formData = new URLSearchParams();
    formData.append('email', 'admin@admin.com');
    formData.append('password', 'admin123');
    formData.append('callbackUrl', `${baseUrl}/dashboard`);
    if (csrfToken) {
      formData.append('csrfToken', csrfToken);
    }

    const formResponse = await makeRequest(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    console.log('📊 Status Form:', formResponse.status);
    console.log('📥 Resposta Form:', formResponse.data.substring(0, 300));

    // 4. Verificar se a rota de providers está funcionando
    console.log('\n4️⃣ Testando rota de providers...');
    const providersResponse = await makeRequest(`${baseUrl}/api/auth/providers`);
    console.log('📊 Status Providers:', providersResponse.status);
    console.log('📥 Providers:', providersResponse.data);

  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testCallbackDebug().catch(console.error);