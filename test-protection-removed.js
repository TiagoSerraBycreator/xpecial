const https = require('https');

async function testProtectionRemoved() {
  console.log('🔍 Testando se a proteção da Vercel foi removida...\n');

  const baseUrl = 'https://xpecial-9bswkhjmb-tiagos-projects-39da614a.vercel.app';
  
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

    console.log('📊 Status HTTP:', response.status);
    
    if (response.status === 401) {
      console.log('❌ Proteção ainda ativa (Status 401)');
      console.log('⏳ Aguarde mais alguns minutos ou verifique as configurações da Vercel');
    } else if (response.status === 200) {
      if (response.data.includes('Vercel Authentication')) {
        console.log('❌ Ainda redirecionando para autenticação da Vercel');
      } else if (response.data.includes('Entre na sua conta') || response.data.includes('Email')) {
        console.log('✅ Proteção removida! Página de login acessível');
        console.log('🎯 Agora você pode testar o login com admin@admin.com / admin123');
      } else {
        console.log('⚠️ Resposta inesperada');
        console.log('📝 Primeiros 200 chars:', response.data.substring(0, 200));
      }
    } else {
      console.log('⚠️ Status inesperado:', response.status);
    }

  } catch (error) {
    console.log('❌ Erro ao testar:', error.message);
  }
}

testProtectionRemoved().catch(console.error);