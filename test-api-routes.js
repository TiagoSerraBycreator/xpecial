const https = require('https');

const baseUrl = 'https://xpecial-9bswkhjmb-tiagos-projects-39da614a.vercel.app';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

async function testApiRoutes() {
  console.log('🔍 Testando rotas da API NextAuth...\n');

  // 1. Testar se a rota da API existe
  console.log('1️⃣ Testando rota base da API...');
  try {
    const response = await makeRequest(`${baseUrl}/api/auth/providers`);
    console.log('📊 Status:', response.status);
    console.log('📋 Content-Type:', response.headers['content-type']);
    console.log('📥 Resposta (primeiros 200 chars):', response.data.substring(0, 200));
    
    if (response.headers['content-type']?.includes('application/json')) {
      console.log('✅ API retornando JSON corretamente');
    } else {
      console.log('❌ API retornando HTML em vez de JSON');
    }
  } catch (error) {
    console.log('❌ Erro na rota providers:', error.message);
  }

  console.log('\n2️⃣ Testando rota de signin...');
  try {
    const response = await makeRequest(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123',
        callbackUrl: `${baseUrl}/dashboard`
      })
    });
    console.log('📊 Status:', response.status);
    console.log('📋 Content-Type:', response.headers['content-type']);
    console.log('📥 Resposta (primeiros 200 chars):', response.data.substring(0, 200));
  } catch (error) {
    console.log('❌ Erro na rota signin:', error.message);
  }

  console.log('\n3️⃣ Testando rota de session...');
  try {
    const response = await makeRequest(`${baseUrl}/api/auth/session`);
    console.log('📊 Status:', response.status);
    console.log('📋 Content-Type:', response.headers['content-type']);
    console.log('📥 Resposta:', response.data);
  } catch (error) {
    console.log('❌ Erro na rota session:', error.message);
  }

  console.log('\n4️⃣ Testando rota de csrf...');
  try {
    const response = await makeRequest(`${baseUrl}/api/auth/csrf`);
    console.log('📊 Status:', response.status);
    console.log('📋 Content-Type:', response.headers['content-type']);
    console.log('📥 Resposta:', response.data);
  } catch (error) {
    console.log('❌ Erro na rota csrf:', error.message);
  }
}

testApiRoutes().catch(console.error);