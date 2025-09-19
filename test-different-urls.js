const https = require('https');

async function testUrl(url, description) {
  console.log(`\n🔍 Testando ${description}: ${url}`);
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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
      req.end();
    });

    console.log('📊 Status:', response.status);
    
    if (response.status === 401) {
      console.log('❌ Protegido pela Vercel');
    } else if (response.status === 200) {
      if (response.data.includes('Vercel Authentication')) {
        console.log('❌ Redirecionando para autenticação Vercel');
      } else if (response.data.includes('Entre na sua conta') || response.data.includes('Email')) {
        console.log('✅ Página acessível!');
      } else if (response.data.includes('{"providers"')) {
        console.log('✅ API funcionando!');
      } else {
        console.log('⚠️ Resposta inesperada');
        console.log('📝 Primeiros 100 chars:', response.data.substring(0, 100));
      }
    } else {
      console.log('⚠️ Status:', response.status);
    }

  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

async function testDifferentUrls() {
  console.log('🔍 Testando diferentes URLs para encontrar uma que funcione...\n');

  const baseUrl = 'https://xpecial-9bswkhjmb-tiagos-projects-39da614a.vercel.app';
  
  // Testar diferentes URLs
  await testUrl(`${baseUrl}`, 'Página inicial');
  await testUrl(`${baseUrl}/login`, 'Página de login');
  await testUrl(`${baseUrl}/api/auth/providers`, 'API Providers');
  await testUrl(`${baseUrl}/api/auth/csrf`, 'API CSRF');
  await testUrl(`${baseUrl}/api/auth/session`, 'API Session');
  
  // Verificar se há uma URL alternativa
  console.log('\n💡 Dicas para resolver:');
  console.log('1. Verifique se a proteção foi realmente desabilitada na Vercel');
  console.log('2. Aguarde alguns minutos para o redeploy');
  console.log('3. Verifique se não há proteção em nível de team/organization');
  console.log('4. Tente acessar diretamente pelo navegador para confirmar');
  
  // Verificar se há uma URL de preview que funciona
  console.log('\n🔄 Você também pode tentar:');
  console.log('- Fazer um novo deploy (git push com uma pequena alteração)');
  console.log('- Verificar se há uma URL de preview diferente na Vercel');
  console.log('- Contactar o suporte da Vercel se o problema persistir');
}

testDifferentUrls().catch(console.error);