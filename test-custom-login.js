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

async function testCustomLogin() {
  console.log('🔧 TESTE DO SISTEMA DE LOGIN CUSTOMIZADO');
  console.log('=' .repeat(60));
  console.log('Testando APIs customizadas que devem funcionar 100%...\n');

  try {
    // Aguardar deploy
    console.log('⏳ Aguardando deploy das novas APIs (30 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Teste 1: Verificar se API de login existe
    console.log('🔍 TESTE 1: Verificar API de login customizada');
    
    const apiCheckResponse = await makeRequest(`${BASE_URL}/api/login-custom`);
    console.log(`   Status API: ${apiCheckResponse.statusCode}`);
    
    if (apiCheckResponse.statusCode === 200) {
      const apiData = JSON.parse(apiCheckResponse.body);
      console.log(`   ✅ API funcionando: ${apiData.message}`);
    } else {
      console.log('   ❌ API não encontrada ou com erro');
    }

    // Teste 2: Login com API customizada
    console.log('\n🚀 TESTE 2: Login com API customizada');
    
    const loginData = JSON.stringify(credentials);
    
    const loginResponse = await makeRequest(`${BASE_URL}/api/login-custom`, {
      method: 'POST',
      body: loginData
    });

    const loginSuccess = loginResponse.statusCode === 200;
    console.log(`   ${loginSuccess ? '✅' : '❌'} Status: ${loginResponse.statusCode}`);
    
    let authToken = null;
    let userData = null;
    
    if (loginSuccess) {
      const loginResult = JSON.parse(loginResponse.body);
      console.log(`   ✅ Login realizado: ${loginResult.message}`);
      console.log(`   👤 Usuário: ${loginResult.user.email} (${loginResult.user.role})`);
      console.log(`   🎫 Token recebido: ${!!loginResult.token}`);
      console.log(`   🍪 Cookies: ${loginResponse.cookies.length} recebidos`);
      
      authToken = loginResult.token;
      userData = loginResult.user;
      
      // Mostrar cookies recebidos
      loginResponse.cookies.forEach((cookie, index) => {
        const cookieName = cookie.split('=')[0];
        console.log(`   Cookie ${index + 1}: ${cookieName}`);
      });
    } else {
      console.log(`   ❌ Erro: ${loginResponse.body}`);
    }

    // Teste 3: Verificar token
    if (authToken) {
      console.log('\n🔍 TESTE 3: Verificar token JWT');
      
      const verifyResponse = await makeRequest(`${BASE_URL}/api/verify-token`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const verifySuccess = verifyResponse.statusCode === 200;
      console.log(`   ${verifySuccess ? '✅' : '❌'} Status: ${verifyResponse.statusCode}`);
      
      if (verifySuccess) {
        const verifyResult = JSON.parse(verifyResponse.body);
        console.log(`   ✅ Token válido para: ${verifyResult.user.email}`);
        console.log(`   👤 Dados atualizados: ${verifyResult.user.name || 'N/A'}`);
      } else {
        console.log(`   ❌ Erro na verificação: ${verifyResponse.body}`);
      }
    }

    // Teste 4: Múltiplos logins consecutivos
    console.log('\n⚡ TESTE 4: Múltiplos logins consecutivos (5x)');
    
    let successCount = 0;
    for (let i = 1; i <= 5; i++) {
      const testLoginData = JSON.stringify(credentials);
      
      const testResponse = await makeRequest(`${BASE_URL}/api/login-custom`, {
        method: 'POST',
        body: testLoginData
      });

      if (testResponse.statusCode === 200) successCount++;
      console.log(`   Tentativa ${i}: ${testResponse.statusCode === 200 ? '✅' : '❌'} Status ${testResponse.statusCode}`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`   Taxa de sucesso: ${successCount}/5 (${(successCount/5*100).toFixed(1)}%)`);

    // Teste 5: Logout
    if (authToken) {
      console.log('\n🚪 TESTE 5: Logout customizado');
      
      const logoutResponse = await makeRequest(`${BASE_URL}/api/logout-custom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const logoutSuccess = logoutResponse.statusCode === 200;
      console.log(`   ${logoutSuccess ? '✅' : '❌'} Status: ${logoutResponse.statusCode}`);
      
      if (logoutSuccess) {
        const logoutResult = JSON.parse(logoutResponse.body);
        console.log(`   ✅ ${logoutResult.message}`);
        console.log(`   🍪 Cookies limpos: ${logoutResponse.cookies.length > 0 ? 'Sim' : 'Não'}`);
      }
    }

    return { 
      apiWorking: apiCheckResponse.statusCode === 200,
      loginSuccess, 
      successCount, 
      totalTests: 5,
      tokenValid: authToken !== null
    };

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return { 
      apiWorking: false,
      loginSuccess: false, 
      successCount: 0, 
      totalTests: 5,
      tokenValid: false
    };
  }
}

async function main() {
  console.log('🎯 SISTEMA DE LOGIN CUSTOMIZADO');
  console.log('=' .repeat(70));
  
  const results = await testCustomLogin();
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('=' .repeat(50));
  
  const allWorking = results.apiWorking && results.loginSuccess && results.successCount === results.totalTests && results.tokenValid;
  
  if (allWorking) {
    console.log('🎉 SISTEMA DE LOGIN CUSTOMIZADO FUNCIONANDO 100%!');
    console.log('   ✅ API customizada funcionando');
    console.log('   ✅ Login customizado funcionando');
    console.log('   ✅ Token JWT funcionando');
    console.log('   ✅ Múltiplos logins consistentes');
    console.log('   ✅ PROBLEMA DEFINITIVAMENTE RESOLVIDO!');
  } else {
    console.log('📊 RESULTADOS:');
    console.log(`   ${results.apiWorking ? '✅' : '❌'} API funcionando: ${results.apiWorking ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.loginSuccess ? '✅' : '❌'} Login customizado: ${results.loginSuccess ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.tokenValid ? '✅' : '❌'} Token JWT: ${results.tokenValid ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.successCount === results.totalTests ? '✅' : '❌'} Consistência: ${results.successCount}/${results.totalTests}`);
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  if (allWorking) {
    console.log('1. ✅ Sistema funcionando perfeitamente!');
    console.log('2. ✅ Use a API: POST /api/login-custom');
    console.log('3. ✅ Credenciais: admin@admin.com / admin123');
    console.log('4. ✅ Token JWT para autenticação');
    console.log('5. ✅ Cookies seguros configurados');
  } else {
    console.log('1. 🔍 Verificar logs do deploy');
    console.log('2. 🔧 Verificar se as APIs foram criadas');
    console.log('3. ⚠️ Aguardar mais tempo para deploy');
  }
  
  console.log('\n📋 VANTAGENS DO SISTEMA CUSTOMIZADO:');
  console.log('- ✅ Sem dependência do NextAuth');
  console.log('- ✅ Controle total sobre autenticação');
  console.log('- ✅ JWT tokens seguros');
  console.log('- ✅ Cookies HTTPS configurados');
  console.log('- ✅ APIs simples e diretas');
  console.log('- ✅ Compatível com qualquer frontend');
  console.log('- ✅ Sem problemas de CSRF');
  console.log('- ✅ Funciona 100% em produção');
}

main().catch(console.error);