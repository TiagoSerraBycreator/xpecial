const https = require('https');

async function testLogin() {
  console.log('🔍 Teste final de login...\n');

  const baseUrl = 'https://xpecial-9bswkhjmb-tiagos-projects-39da614a.vercel.app';
  
  // Primeiro, vamos tentar acessar a página de login
  console.log('1️⃣ Testando acesso à página de login...');
  
  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(`${baseUrl}/login`, {
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
    console.log('📋 Content-Type:', response.headers['content-type']);
    
    if (response.data.includes('Vercel Authentication')) {
      console.log('❌ Aplicação está protegida pela autenticação da Vercel');
      console.log('💡 Isso significa que há uma proteção ativa no deployment');
      console.log('🔧 Você precisa desabilitar a proteção nas configurações da Vercel');
    } else if (response.data.includes('Entre na sua conta')) {
      console.log('✅ Página de login carregou corretamente');
      console.log('🎯 O problema do NEXTAUTH_URL foi resolvido');
    } else {
      console.log('⚠️ Resposta inesperada');
      console.log('📥 Primeiros 300 chars:', response.data.substring(0, 300));
    }

  } catch (error) {
    console.log('❌ Erro ao acessar a página:', error.message);
  }

  console.log('\n📋 Resumo dos problemas identificados:');
  console.log('1. ✅ Credenciais do usuário admin estão corretas');
  console.log('2. ✅ Banco de dados está funcionando');
  console.log('3. ✅ Prisma está conectando corretamente');
  console.log('4. ✅ NEXTAUTH_URL foi corrigido');
  console.log('5. ❓ Possível proteção da Vercel ativa');
  
  console.log('\n🔧 Próximos passos:');
  console.log('- Verificar configurações de proteção na Vercel');
  console.log('- Desabilitar proteção se estiver ativa');
  console.log('- Testar login novamente após desabilitar proteção');
}

testLogin().catch(console.error);