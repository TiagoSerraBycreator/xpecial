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

async function testNextAuthFixed() {
  console.log('🔧 TESTE NEXTAUTH CORRIGIDO');
  console.log('=' .repeat(50));
  console.log('🎯 Testando configuração NextAuth otimizada para Vercel');

  try {
    // Aguardar deploy
    console.log('⏳ Aguardando deploy das correções (60 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Teste 1: Verificar CSRF token
    console.log('\n🔍 TESTE 1: Verificar CSRF Token');
    const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    console.log(`   Status: ${csrfResponse.statusCode}`);
    
    let csrfToken = null;
    if (csrfResponse.statusCode === 200) {
      const csrfData = JSON.parse(csrfResponse.body);
      csrfToken = csrfData.csrfToken;
      console.log(`   ✅ CSRF Token obtido: ${csrfToken ? 'SIM' : 'NÃO'}`);
    } else {
      console.log(`   ❌ Erro ao obter CSRF: ${csrfResponse.body}`);
    }

    // Teste 2: Login com NextAuth
    console.log('\n🚀 TESTE 2: Login com NextAuth');
    
    const loginData = new URLSearchParams({
      email: 'admin@admin.com',
      password: 'admin123',
      redirect: 'false',
      json: 'true'
    });

    if (csrfToken) {
      loginData.append('csrfToken', csrfToken);
    }

    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': csrfResponse.headers['set-cookie'] ? csrfResponse.headers['set-cookie'].join('; ') : ''
      },
      body: loginData.toString()
    });

    console.log(`   Status: ${loginResponse.statusCode}`);
    console.log(`   Headers: ${JSON.stringify(loginResponse.headers, null, 2)}`);
    
    if (loginResponse.statusCode === 200) {
      try {
        const result = JSON.parse(loginResponse.body);
        console.log('   ✅ LOGIN FUNCIONANDO!');
        console.log(`   📄 Resposta: ${JSON.stringify(result, null, 2)}`);
        
        // Verificar se há cookies de sessão
        const sessionCookies = loginResponse.headers['set-cookie'];
        if (sessionCookies) {
          console.log('   🍪 Cookies de sessão definidos:');
          sessionCookies.forEach(cookie => {
            console.log(`      ${cookie}`);
          });
        }
        
      } catch (e) {
        console.log(`   📄 Resposta (não JSON): ${loginResponse.body}`);
      }
    } else {
      console.log(`   ❌ Erro no login: ${loginResponse.body}`);
    }

    // Teste 3: Verificar sessão
    if (loginResponse.statusCode === 200 && loginResponse.headers['set-cookie']) {
      console.log('\n🔍 TESTE 3: Verificar Sessão');
      
      const sessionResponse = await makeRequest(`${BASE_URL}/api/auth/session`, {
        headers: {
          'Cookie': loginResponse.headers['set-cookie'].join('; ')
        }
      });

      console.log(`   Status: ${sessionResponse.statusCode}`);
      
      if (sessionResponse.statusCode === 200) {
        try {
          const sessionData = JSON.parse(sessionResponse.body);
          console.log('   ✅ SESSÃO ATIVA!');
          console.log(`   👤 Usuário: ${sessionData.user?.email || 'N/A'}`);
          console.log(`   🎭 Role: ${sessionData.user?.role || 'N/A'}`);
        } catch (e) {
          console.log(`   📄 Sessão: ${sessionResponse.body}`);
        }
      } else {
        console.log(`   ❌ Erro na sessão: ${sessionResponse.body}`);
      }
    }

    // Teste 4: Múltiplos logins
    console.log('\n⚡ TESTE 4: Múltiplos logins consecutivos');
    let successCount = 0;
    
    for (let i = 1; i <= 3; i++) {
      console.log(`   Tentativa ${i}:`);
      
      // Obter novo CSRF para cada tentativa
      const newCsrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
      let newCsrfToken = null;
      
      if (newCsrfResponse.statusCode === 200) {
        const newCsrfData = JSON.parse(newCsrfResponse.body);
        newCsrfToken = newCsrfData.csrfToken;
      }
      
      const testLoginData = new URLSearchParams({
        email: 'admin@admin.com',
        password: 'admin123',
        redirect: 'false',
        json: 'true'
      });

      if (newCsrfToken) {
        testLoginData.append('csrfToken', newCsrfToken);
      }

      const testLoginResponse = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': newCsrfResponse.headers['set-cookie'] ? newCsrfResponse.headers['set-cookie'].join('; ') : ''
        },
        body: testLoginData.toString()
      });

      if (testLoginResponse.statusCode === 200) {
        successCount++;
        console.log(`      ✅ Sucesso (${testLoginResponse.statusCode})`);
      } else {
        console.log(`      ❌ Falhou (${testLoginResponse.statusCode})`);
      }
    }
    
    console.log(`\n📊 Taxa de sucesso: ${successCount}/3 (${(successCount/3*100).toFixed(1)}%)`);

    return {
      csrfWorking: csrfResponse.statusCode === 200,
      loginWorking: loginResponse.statusCode === 200,
      consistencyRate: successCount / 3
    };

  } catch (error) {
    console.error('\n❌ Erro durante teste:', error.message);
    return {
      csrfWorking: false,
      loginWorking: false,
      consistencyRate: 0
    };
  }
}

async function main() {
  console.log('🎯 XPECIAL - TESTE NEXTAUTH CORRIGIDO');
  console.log('=' .repeat(60));
  console.log('🔧 Testando correções na configuração do NextAuth');
  console.log('⚡ Configuração otimizada para Vercel');
  
  const results = await testNextAuthFixed();
  
  console.log('\n📋 RESULTADO FINAL:');
  console.log('=' .repeat(30));
  
  if (results.loginWorking && results.consistencyRate >= 0.8) {
    console.log('🎉 NEXTAUTH FUNCIONANDO PERFEITAMENTE!');
    console.log('   ✅ CSRF Token: OK');
    console.log('   ✅ Login: OK');
    console.log(`   ✅ Consistência: ${(results.consistencyRate*100).toFixed(1)}%`);
    console.log('   🚀 Problema resolvido com NextAuth!');
  } else {
    console.log('📊 Status do NextAuth:');
    console.log(`   ${results.csrfWorking ? '✅' : '❌'} CSRF Token: ${results.csrfWorking ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.loginWorking ? '✅' : '❌'} Login: ${results.loginWorking ? 'OK' : 'FALHOU'}`);
    console.log(`   📊 Consistência: ${(results.consistencyRate*100).toFixed(1)}%`);
    
    if (!results.loginWorking) {
      console.log('\n⚠️ NextAuth ainda com problemas.');
      console.log('   Verificar logs do Vercel para mais detalhes.');
    }
  }
}

main().catch(console.error);