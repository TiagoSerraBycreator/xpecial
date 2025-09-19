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
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
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

async function testSimple() {
  console.log('🔍 TESTE SIMPLES - VERIFICAR DEPLOY');
  console.log('=' .repeat(50));

  try {
    // Aguardar mais tempo para deploy
    console.log('⏳ Aguardando deploy (60 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Teste 1: API Login GET
    console.log('\n🔍 TESTE 1: GET /api/login-custom');
    const loginGetResponse = await makeRequest(`${BASE_URL}/api/login-custom`);
    console.log(`   Status: ${loginGetResponse.statusCode}`);
    if (loginGetResponse.statusCode === 200) {
      console.log(`   ✅ API encontrada: ${loginGetResponse.body}`);
    } else {
      console.log(`   ❌ Erro: ${loginGetResponse.body}`);
    }

    // Teste 2: API Verify GET
    console.log('\n🔍 TESTE 2: GET /api/verify-token');
    const verifyGetResponse = await makeRequest(`${BASE_URL}/api/verify-token`);
    console.log(`   Status: ${verifyGetResponse.statusCode}`);
    if (verifyGetResponse.statusCode === 401) {
      console.log('   ✅ API funcionando (401 esperado sem token)');
    } else {
      console.log(`   Resposta: ${verifyGetResponse.body}`);
    }

    // Teste 3: API Logout GET
    console.log('\n🔍 TESTE 3: GET /api/logout-custom');
    const logoutGetResponse = await makeRequest(`${BASE_URL}/api/logout-custom`);
    console.log(`   Status: ${logoutGetResponse.statusCode}`);
    if (logoutGetResponse.statusCode === 200) {
      console.log(`   ✅ API encontrada: ${logoutGetResponse.body}`);
    } else {
      console.log(`   ❌ Erro: ${logoutGetResponse.body}`);
    }

    // Teste 4: Login POST se APIs estão funcionando
    if (loginGetResponse.statusCode === 200) {
      console.log('\n🚀 TESTE 4: POST /api/login-custom (Login real)');
      
      const loginData = JSON.stringify({
        email: 'admin@admin.com',
        password: 'admin123'
      });
      
      const loginPostResponse = await makeRequest(`${BASE_URL}/api/login-custom`, {
        method: 'POST',
        body: loginData
      });

      console.log(`   Status: ${loginPostResponse.statusCode}`);
      
      if (loginPostResponse.statusCode === 200) {
        const result = JSON.parse(loginPostResponse.body);
        console.log('   ✅ LOGIN FUNCIONANDO!');
        console.log(`   👤 Usuário: ${result.user.email}`);
        console.log(`   🎫 Token: ${!!result.token}`);
        console.log('   🎉 PROBLEMA RESOLVIDO!');
      } else {
        console.log(`   ❌ Erro no login: ${loginPostResponse.body}`);
      }
    }

    return {
      loginApiWorking: loginGetResponse.statusCode === 200,
      verifyApiWorking: verifyGetResponse.statusCode === 401,
      logoutApiWorking: logoutGetResponse.statusCode === 200
    };

  } catch (error) {
    console.error('❌ Erro:', error.message);
    return {
      loginApiWorking: false,
      verifyApiWorking: false,
      logoutApiWorking: false
    };
  }
}

async function main() {
  console.log('🎯 VERIFICAÇÃO DE DEPLOY - APIS CUSTOMIZADAS');
  console.log('=' .repeat(60));
  
  const results = await testSimple();
  
  console.log('\n📊 RESULTADO:');
  console.log('=' .repeat(30));
  
  const allWorking = results.loginApiWorking && results.verifyApiWorking && results.logoutApiWorking;
  
  if (allWorking) {
    console.log('🎉 TODAS AS APIS FUNCIONANDO!');
    console.log('   ✅ Login API: OK');
    console.log('   ✅ Verify API: OK');
    console.log('   ✅ Logout API: OK');
    console.log('   🚀 Sistema pronto para uso!');
  } else {
    console.log('📊 Status das APIs:');
    console.log(`   ${results.loginApiWorking ? '✅' : '❌'} Login API: ${results.loginApiWorking ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.verifyApiWorking ? '✅' : '❌'} Verify API: ${results.verifyApiWorking ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.logoutApiWorking ? '✅' : '❌'} Logout API: ${results.logoutApiWorking ? 'OK' : 'FALHOU'}`);
    
    if (!allWorking) {
      console.log('\n⚠️ Algumas APIs ainda não foram deployadas.');
      console.log('   Aguarde mais alguns minutos e teste novamente.');
    }
  }
}

main().catch(console.error);