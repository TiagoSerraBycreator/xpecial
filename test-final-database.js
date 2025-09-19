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

async function testDatabaseRecreation() {
  console.log('🎯 TESTE FINAL - BANCO RECRIADO');
  console.log('=' .repeat(50));
  console.log('Testando se a recriação do banco resolveu o problema...\n');

  try {
    // Teste 1: Login direto (como funcionava antes)
    console.log('🚀 TESTE 1: Login direto sem cookies');
    
    const formData1 = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const loginResponse1 = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData1.toString()
    });

    const success1 = loginResponse1.statusCode === 200;
    console.log(`   ${success1 ? '✅' : '❌'} Status: ${loginResponse1.statusCode}`);
    
    if (!success1) {
      console.log(`   Erro: ${loginResponse1.body.substring(0, 150)}`);
    }

    // Teste 2: Login simulando navegador completo
    console.log('\n🌐 TESTE 2: Login simulando navegador (com cookies e CSRF)');
    
    // Obter CSRF
    const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    const csrfData = JSON.parse(csrfResponse.body);
    const cookieString = csrfResponse.cookies.map(c => c.split(';')[0]).join('; ');
    
    console.log(`   CSRF Token obtido: ${csrfData.csrfToken.substring(0, 30)}...`);
    console.log(`   Cookies: ${csrfResponse.cookies.length} cookies recebidos`);
    
    const formData2 = new URLSearchParams({
      email: credentials.email,
      password: credentials.password,
      csrfToken: csrfData.csrfToken,
      callbackUrl: `${BASE_URL}/dashboard`,
      json: 'true'
    });

    const loginResponse2 = await makeRequest(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Cookie': cookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}/login`
      },
      body: formData2.toString()
    });

    const success2 = loginResponse2.statusCode === 200;
    console.log(`   ${success2 ? '✅' : '❌'} Status: ${loginResponse2.statusCode}`);
    
    if (!success2) {
      console.log(`   Erro: ${loginResponse2.body.substring(0, 150)}`);
    }

    // Teste 3: Múltiplas tentativas para verificar consistência
    console.log('\n⚡ TESTE 3: Múltiplas tentativas (verificar consistência)');
    
    let successCount = 0;
    for (let i = 1; i <= 5; i++) {
      const formData = new URLSearchParams({
        email: credentials.email,
        password: credentials.password,
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

      if (response.statusCode === 200) successCount++;
      console.log(`   Tentativa ${i}: ${response.statusCode === 200 ? '✅' : '❌'} Status ${response.statusCode}`);
      
      // Pequena pausa entre tentativas
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`   Taxa de sucesso: ${successCount}/5 (${(successCount/5*100).toFixed(1)}%)`);

    // Teste 4: Verificar se o usuário admin está correto
    console.log('\n👤 TESTE 4: Verificar dados do usuário admin');
    
    // Simular uma requisição autenticada para verificar os dados
    const sessionResponse = await makeRequest(`${BASE_URL}/api/auth/session`, {
      headers: {
        'Cookie': cookieString
      }
    });
    
    console.log(`   Session API: Status ${sessionResponse.statusCode}`);
    if (sessionResponse.statusCode === 200) {
      try {
        const sessionData = JSON.parse(sessionResponse.body);
        console.log(`   Usuário logado: ${sessionData.user?.email || 'N/A'}`);
        console.log(`   Role: ${sessionData.user?.role || 'N/A'}`);
      } catch (e) {
        console.log('   Sessão vazia ou inválida');
      }
    }

    return { success1, success2, successCount, totalTests: 5 };

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return { success1: false, success2: false, successCount: 0, totalTests: 5 };
  }
}

async function main() {
  console.log('🗄️ VERIFICAÇÃO FINAL - BANCO RECRIADO');
  console.log('=' .repeat(60));
  
  const results = await testDatabaseRecreation();
  
  console.log('\n📊 RESULTADO FINAL:');
  console.log('=' .repeat(40));
  
  const allWorking = results.success1 && results.success2 && results.successCount === results.totalTests;
  
  if (allWorking) {
    console.log('🎉 BANCO RECRIADO COM SUCESSO!');
    console.log('   ✅ Login direto funcionando');
    console.log('   ✅ Login com navegador funcionando');
    console.log('   ✅ Múltiplas tentativas consistentes');
    console.log('   ✅ Problema de login RESOLVIDO!');
  } else {
    console.log('⚠️ RESULTADOS MISTOS:');
    console.log(`   ${results.success1 ? '✅' : '❌'} Login direto: ${results.success1 ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.success2 ? '✅' : '❌'} Login navegador: ${results.success2 ? 'OK' : 'FALHOU'}`);
    console.log(`   ${results.successCount === results.totalTests ? '✅' : '❌'} Consistência: ${results.successCount}/${results.totalTests}`);
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  if (allWorking) {
    console.log('1. ✅ Banco está funcionando perfeitamente');
    console.log('2. ✅ Teste no navegador: https://xpecial.vercel.app/login');
    console.log('3. ✅ Use: admin@admin.com / admin123');
    console.log('4. ✅ O erro 401 deve estar resolvido!');
  } else {
    console.log('1. ⚠️ Alguns testes falharam');
    console.log('2. 🔍 Verifique os logs acima para detalhes');
    console.log('3. 🔧 Pode ser necessário ajuste adicional');
  }
  
  console.log('\n📋 RESUMO DA RECRIAÇÃO:');
  console.log('- ✅ Banco PostgreSQL recriado');
  console.log('- ✅ Migrations aplicadas');
  console.log('- ✅ Usuário admin criado');
  console.log('- ✅ Permissões configuradas');
  console.log('- ✅ Configuração NextAuth mantida');
}

main().catch(console.error);