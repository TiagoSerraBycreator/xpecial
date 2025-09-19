const https = require('https');
const http = require('http');

const BASE_URL = 'https://xpecial.vercel.app';

console.log('🧪 Teste Final do NextAuth - Verificando se tudo está funcionando');
console.log('='.repeat(60));

async function makeRequest(url, options = {}, followRedirects = true) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Se é um redirecionamento e devemos seguir
        if (followRedirects && (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308)) {
          const location = res.headers.location;
          if (location) {
            const newUrl = location.startsWith('http') ? location : new URL(location, url).href;
            makeRequest(newUrl, options, followRedirects).then(resolve).catch(reject);
            return;
          }
        }
        
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

async function testFinalSolution() {
  try {
    console.log('1. 🔍 Testando se a aplicação está online...');
    const homeResponse = await makeRequest(BASE_URL);
    console.log(`   Status: ${homeResponse.status}`);
    
    if (homeResponse.status === 200) {
      console.log('✅ Aplicação está online');
    } else {
      console.log(`⚠️  Status inesperado: ${homeResponse.status}`);
    }
    
    console.log('\n2. 🔍 Testando endpoint do NextAuth...');
    const authResponse = await makeRequest(`${BASE_URL}/api/auth/providers`);
    console.log(`   Status: ${authResponse.status}`);
    
    if (authResponse.status === 200) {
      console.log('✅ NextAuth está respondendo');
      try {
        const providers = JSON.parse(authResponse.data);
        console.log('   Provedores disponíveis:', Object.keys(providers));
      } catch (e) {
        console.log('   Resposta recebida mas não é JSON válido');
      }
    } else {
      console.log('❌ NextAuth não está respondendo');
    }
    
    console.log('\n3. 🔍 Testando CSRF token...');
    const csrfResponse = await makeRequest(`${BASE_URL}/api/auth/csrf`);
    console.log(`   Status: ${csrfResponse.status}`);
    
    if (csrfResponse.status === 200) {
      console.log('✅ CSRF token está funcionando');
      try {
        const csrf = JSON.parse(csrfResponse.data);
        console.log('   CSRF Token obtido:', csrf.csrfToken ? 'Sim' : 'Não');
      } catch (e) {
        console.log('   Resposta recebida mas não é JSON válido');
      }
    } else {
      console.log('❌ CSRF token não está funcionando');
    }
    
    console.log('\n4. 🔍 Testando signin endpoint...');
    const signinResponse = await makeRequest(`${BASE_URL}/api/auth/signin`);
    console.log(`   Status: ${signinResponse.status}`);
    
    if (signinResponse.status === 200) {
      console.log('✅ Signin endpoint está funcionando');
    } else {
      console.log('❌ Signin endpoint não está funcionando');
    }
    
    console.log('\n5. 🔍 Testando página de login...');
    const loginPageResponse = await makeRequest(`${BASE_URL}/login`);
    console.log(`   Status: ${loginPageResponse.status}`);
    
    if (loginPageResponse.status === 200) {
      console.log('✅ Página de login está acessível');
    } else {
      console.log('❌ Página de login não está acessível');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DO TESTE FINAL:');
    console.log('='.repeat(60));
    
    const allWorking = authResponse.status === 200 && 
                      csrfResponse.status === 200 && 
                      signinResponse.status === 200;
    
    if (allWorking) {
      console.log('🎉 SUCESSO! NextAuth está funcionando corretamente!');
      console.log('✅ Todos os endpoints essenciais estão respondendo');
      console.log('✅ A aplicação está pronta para uso');
      console.log('\n💡 Próximos passos:');
      console.log('   1. Teste o login manualmente no navegador');
      console.log('   2. Verifique se a sessão está sendo mantida');
      console.log('   3. Teste o logout');
      console.log('\n🔗 Acesse: https://xpecial.vercel.app/login');
    } else {
      console.log('⚠️  Alguns problemas foram encontrados');
      console.log('   Verifique os logs do Vercel para mais detalhes');
    }
    
  } catch (error) {
    console.error('💥 Erro durante o teste:', error.message);
  }
}

testFinalSolution();